const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient(process.env.APP_IPFS_HOST, process.env.APP_IPFS_PORT, { protocol: process.env.APP_IPFS_PROTOCOL })


async function uploadDocumentToIpfs(encryptedFileList, cb = () => { }) {
    const bufferArray = encryptedFileList.reduce((r, encryptedFile) => {
        const fileContent = ipfs.Buffer.from(encryptedFile.dataUrl)
        r.push({ path: `${encryptedFile.name}`, content: fileContent })
        if (encryptedFile.thumbnailDataUrl) {
            const thumbnailContent = ipfs.Buffer.from(encryptedFile.thumbnailDataUrl)
            r.push({ path: `thumbnail/${encryptedFile.name}`, content: thumbnailContent })
        }

        return r;
    }, [])

    // console.log('bufferArray', bufferArray)

    return ipfs.add(bufferArray).then(ipfsResponses => {

        const finalIpfsResponse = encryptedFileList.map(file => {
            const fileIpfsResponse = ipfsResponses.find(ipfsResponse => file.name === ipfsResponse.path)
            const thumbnailIpfsresponse = ipfsResponses.find(ipfsResponse => `thumbnail/${file.name}` === ipfsResponse.path)
            return ({
                hash: fileIpfsResponse.hash,
                name: fileIpfsResponse.path,
                type: file.type,
                size: file.size,
                thumbnailHash: thumbnailIpfsresponse && thumbnailIpfsresponse.hash
            })
        })
        // console.log('ipfs res', ipfsResponses, finalIpfsResponse)
        cb(null, finalIpfsResponse)

        return Promise.resolve({ value: finalIpfsResponse })
    }, failureResponse => {
        cb(failureResponse)
        console.log('failure ipfs Response:', failureResponse)
        return Promise.resolve({ error: { type: 'error', ...failureResponse.spread(), location: { file: __filename, function: 'uploadDocumentToIpfs' } } })
    }).catch(err => {
        cb(err)
        console.log('ipfs catch:', err)
        return Promise.resolve({ error: { type: 'error', ...err.spread(), location: { file: __filename, function: 'uploadDocumentToIpfs' } } })
    })

}


module.exports = {
    uploadDocumentToIpfs
}