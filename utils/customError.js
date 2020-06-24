/*
Custom error class for error management

*/
class CustomError extends Error {
    constructor(error, type, errorCode) {
        super(error)
        let errorType = 'error'
        if (!errorCode) errorCode = 400
        if (['error', 'info'].indexOf(type) > -1) {
            errorType = type
        }

        if (error instanceof CustomError) {
            this.message = error.message
            this.stack = error.stack

            this.errorMessage = error.errorMessage
            this.time = error.time
            this.type = error.type
            this.errorCode = error.errorCode
        } else if (error instanceof Error) {
            this.message = error.message
            this.stack = error.stack

            this.errorMessage = error.message
            this.time = new Date()
            this.type = errorType
            this.errorCode = errorCode
        } else {
            this.errorMessage = error
            this.time = new Date()
            this.type = errorType
            this.errorCode = errorCode
        }
        return this
    }
}

module.exports = CustomError;