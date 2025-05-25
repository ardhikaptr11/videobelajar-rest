const throwError = (msg, status = 500) => {
	const error = new Error(msg);
	error.status = status;
	throw error;
};

module.exports = throwError;
