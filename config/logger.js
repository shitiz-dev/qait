var winston = require('winston');
const { combine, timestamp, label, printf, prettyPrint } = winston.format;

require('winston-daily-rotate-file');

winston.addColors({ error: 'red', info: 'green', debug: 'yellow' });

var errorTransport = new (winston.transports.DailyRotateFile)({
    filename: 'log/error.log',
    datePattern: 'YYYY-MM-DD.',
    prepend: true,
    level: 'error'
});
var infoTransport = new (winston.transports.DailyRotateFile)({
    filename: 'log/combined.log',
    datePattern: 'YYYY-MM-DD.',
    prepend: true,
    level: 'info'
});

var logger = winston.createLogger(
    {
        format: combine(
            label({ label: 'Appilication: CSV Records PRE Processor' }),
            timestamp(),
            prettyPrint()
        ),

        transports: [
            errorTransport,
            infoTransport
        ],
        exitOnError: false
    });


const myFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} ${level}: ${message}`;
});

const auditErrorTransport = new (winston.transports.DailyRotateFile)({
    filename: 'log/audit/error.log',
    datePattern: 'YYYY-MM-DD.',
    prepend: true,
    level: 'error',
    maxsize: 1024 * 1024, // 1MB
});

const auditCombinedTransport = new (winston.transports.DailyRotateFile)({
    filename: 'log/audit/combined.log',
    datePattern: 'YYYY-MM-DD.',
    prepend: true,
    maxsize: 1024 * 1024, // 1MB
})

const auditLogger = winston.createLogger({
    level: 'debug',
    format: combine(
        label({ label: 'Appilication: CSV Row PRE Processor' }),
        timestamp(),
        prettyPrint()
    ),

    transports: [
        auditErrorTransport,
        auditCombinedTransport
    ],
    exitOnError: false
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
    // auditLogger.add(new winston.transports.Console({
    //     format: winston.format.simple()
    // }));
}




module.exports = { logger, auditLogger };