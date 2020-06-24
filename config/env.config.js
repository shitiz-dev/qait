const path = require('path')
const dotenv = require('dotenv')


const envConfPath = path.join(__dirname, '../.env')

dotenv.config({
    path: envConfPath
})

