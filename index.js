require('./config/env.config');
require('./utils/override')
const CSVRecordProcessService = require('./services/csvrecordprocess.service')
// let DbService = require('./services/db.service')



CSVRecordProcessService.pollQueueForMessages();

// module.exports.handler = async function (event, context) {
//     try {
//         context.callbackWaitsForEmptyEventLoop = false;
//         const { value, error } = await DbService.connect();
//         if (error) throw error
//         console.log("LOG:::")
//         console.log(event);
//         const records = event.Records
//         records && await CSVRecordProcessService.onrecieveQueueMessage(records)
//     } catch (error) {
//         console.log('error', error)
//     }
// }
















