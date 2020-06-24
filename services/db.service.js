const mongoose = require('mongoose')
const CustomError = require('../utils/customError')
let isConnected;

var dbURI = `${process.env.APP_DB_PROTOCOL}://${process.env.APP_DB_USER ? process.env.APP_DB_USER + ":" + process.env.APP_DB_PASS + "@" : ""}${process.env.APP_DB_URL}${process.env.APP_DB_PORT ? ':' + process.env.APP_DB_PORT : ''}/${process.env.APP_DB_NAME}`

const datbaseStates = {
	[0]: 'disconnected',
	[1]: 'connected',
	[2]: 'connecting',
	[3]: 'disconnecting'
}

const connect = function () {
	console.log('dbURI :: ', dbURI)

	if (isConnected) {
		console.log('=> using existing database connection');
		return Promise.resolve({ value: 1 });
	}

	return mongoose.connect(dbURI, { useUnifiedTopology: true, autoIndex: true, autoCreate: true, auto_reconnect: true, useFindAndModify: false, useNewUrlParser: true, useCreateIndex: true })
		.then(db => {
			console.log('Databse connected', db.connections[0].readyState)
			isConnected = db.connections[0].readyState;
			return { value: db.connections[0].readyState }
		}).catch(err => {
			return { error: err }
		})
}

const closeConnection = async function () {
	mongoose.connection.close()
}


function getDbConnectionState() {
	try {
		return { value: datbaseStates[mongoose.connection.readyState], error: null }
	} catch (error) {
		return { value: null, error: new Error('database : something went wrong') }
	}
}

function canFetchDocFromDb() {
	return mongoose.connection.collections.users.find({}).count()
		.then(count => ({ value: 'success', error: null }))
		.catch(err => ({ value: 'failed', error: null }))
}

module.exports = { connect, getDbConnectionState, canFetchDocFromDb, closeConnection }
