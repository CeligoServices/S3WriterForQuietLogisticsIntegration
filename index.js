var extension = require('lambda-integrator-extension');
var functions = require('./functions');

var options = { diy: functions };
exports.handler = extension.createHandler(options);