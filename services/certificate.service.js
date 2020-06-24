var path = require('path');
var fs = require('fs');
var PizZip = require('pizzip');
var Docxtemplater = require('docxtemplater');
const { v4: uuidv4 } = require('uuid');
const { writeFile } = require('../utils/s3');
const libre = require('libreoffice-convert');

const tempPath = '/tmp'

async function generateCertificate(data, templatePath, cb = () => { }) {
    ////console.log('generateCertificate called')
    const uid = uuidv4();
    const inputFileName = `inp-${uid}`
    const outputFileName = `op-${uid}`
    try {
        const file = await loadDoc(data, templatePath, inputFileName, outputFileName)
        // //console.log('Data Url generateCertificate', file)
        const dataUrl = `data:application/pdf;base64,${file}`
        const buffer = Buffer.from(file);
        return { value: {dataUrl, size:buffer.length}, error: null }
    }
    catch (error) {
        ////console.log('Data Url generateCertificate error', error)
        return { error: { type: 'error', ...error.spread(), location: { file: __filename, function: 'generateCertificate' } } }
    } finally {
        deleteFiles(`${tempPath}/`, [`${inputFileName}.docx`, `${outputFileName}.pdf`]) // delete all files at once
            .then(() => console.log("Deleting temp files"))
            .catch(error => errorHandler(error));
    }
}

let deleteFiles = (dir, Files = []) => {
    let promises = Files.map(filename => {
        return new Promise((resolve, reject) => {
            fs.unlink(path.join(dir, filename), err => {
                err ? reject(err) : resolve();
            });
        });
    });
    return Promise.all(promises);
};


async function loadDoc(jsonData, templatePath, input, output) {
    try {
        let doc;
        await writeFile(templatePath, `${tempPath}/${input}.docx`, 'validate-me-preview-poc')
        const content = fs.readFileSync(`${tempPath}/${input}.docx`, 'binary');
        const zip = new PizZip(content);
        doc = new Docxtemplater(zip);
        const data = jsonData.csvCertificate.csv
        doc.setData(data);
        doc.render()
        const buf = doc.getZip()
            .generate({ type: 'nodebuffer' });
        //console.log('Placeholder replaced with user data')
        return new Promise((resolve, reject) => {
            libre.convert(buf, '.pdf', 'writer_pdf_Export', (err, done) => {
                if (err) {
                    //console.log(`Error converting file: ${err}`);
                    reject('unable to convert')
                }
                fs.writeFileSync(`${tempPath}/${output}.pdf`, done);
                //console.log('File converted from docx to pdf')
                fs.readFile(`${tempPath}/${output}.pdf`, (err, data) => {
                    resolve(data.toString('base64'))
                })
            });
        })

    } catch (err) {
        errorHandler(err);
    }
}

function errorHandler(error) {
    if (error.properties && error.properties.errors instanceof Array) {
        const errorMessages = error.properties.errors.map(function (error) {
            return error.properties.explanation;
        }).join("\n");
    }
    throw error;
}
module.exports = { generateCertificate }