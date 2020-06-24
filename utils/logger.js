const logger = require('./../config/logger').logger
const auditLogger = require('./../config/logger').auditLogger
const logError = function (err) {
    if (process.env.NODE_ENV === 'development') {
        console.error(err);
        // return;
    }

    if (err.type && err.type === 'error') {
        logger.error(JSON.stringify(err));
    } else {
        logger.info(JSON.stringify(err))
    }

    return;
}
const sendErrorMail = function (err) {
    logger.error(JSON.stringify(err))
}
const logInfo = function (info) {
    process.env.NODE_ENV === 'development' && console.log(info);
}

const logAudit = function (log) {
    auditLogger.log({
        level: log.level,
        message: log.message
    });
}

module.exports = { logError, logAudit, sendErrorMail, logInfo }