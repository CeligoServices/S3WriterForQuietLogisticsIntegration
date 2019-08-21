var util = require('util');

module.exports = function NoDataError() {
	Error.call(this);
	this.message = 'Reader found no data.';
};

util.inherits(module.exports, Error);