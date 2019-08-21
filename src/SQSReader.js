var Promise = require('bluebird');
var NoDataError = require('./NoDataError');

module.exports = function SQSReader(AWS) {
	var REQUIRED_OPTIONS = [ 'queueUrl' ];

	var validateOptions = function(options) {

		options = options || {};

		var missing = [];

		for (var i = 0; i < REQUIRED_OPTIONS.length; i++) {
			var option = REQUIRED_OPTIONS[i];
			if (!options[option]) {
				missing.push(option);
			}
		}

		return missing;

	};

	this.read = function(options, response, callback) {
		var config = options.configuration || {};
		if(config && config.logData) {
			console.log('SQS Reader: ' + JSON.stringify({
				response : response,
				config : config
			}));
		}

		var missing = validateOptions(config);
		if (missing.length > 0) {
			return Promise.reject(new Error(
					'Missing required config read option(s): '
							+ missing.join(', ')));
		}

		var awsAccessKey = options.connection.unencrypted.awsAccessKey;
		var secretAccessKey = options.connection.encrypted.secretAccessKey;
		var maxMessages = options.maxMessages || 10;
		var region = options.connection.unencrypted.region || 'us-east-1';
		var sqs = new AWS.SQS({
			credentials : new AWS.Credentials(awsAccessKey, secretAccessKey),
			region : region
		});

		// add delete message
		return new Promise(
				function(fulfill, reject) {
					sqs.receiveMessage(
									{
										QueueUrl : config.queueUrl,
										MaxNumberOfMessages : maxMessages
									},
									function(error, result) {
										if (error) {
											return reject(error);
										}

										if (result) {
											if(config && config.logData) {
												console.log('SQS Reader Results: ', JSON.stringify(result));
											}
											if (result.Messages
													&& result.Messages.length > 0
													&& result.Messages[0].ReceiptHandle) {
												//response.lastPage = false;
												var Entries = [];
												for (var i = 0; i < result.Messages.length; i++) {
													Entries[i] = {
														Id : result.Messages[i].MessageId,
														ReceiptHandle : result.Messages[i].ReceiptHandle
													};
												}
												if(!config.doNotDeleteMessages) {
													sqs.deleteMessageBatch(
															{
																QueueUrl : config.queueUrl,
																Entries : Entries
															},
															function(err,data) {
																if (err) {
																	console.log('err',err.stack); // an error occurred
																}
																else {
																	console.log('deletedata',data);
																}
															}
													);
												}
											}
											response.data = result.Messages;
											return fulfill(response);
										} else if (!result) {
											return reject(new NoDataError());
										}
									});
				}).nodeify(callback);
	};

};
