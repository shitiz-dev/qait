
// Add a method spread in Error Class to return all non-enumerable properties.
Error.prototype.spread = function () {
	const errorProperties = Object.getOwnPropertyNames(this);
	let errorObj = {}
	for(key in errorProperties){
		errorObj[errorProperties[key]+''] = this[errorProperties[key]]
	}
	return errorObj
}

global.console = process.env.NODE_ENV==='production' ? {
	log : () => {},
	error : () => {},
	info : () => {}
} : global.console