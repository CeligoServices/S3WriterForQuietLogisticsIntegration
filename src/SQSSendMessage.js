var Promise = require('bluebird');

module.exports = function SqsWriter(AWS) {

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

	var validateConnection = function(connection, unencryptedFields,
			encryptedFields) {

		var missing = [];

		if (!connection) {
			missing.push('connection');
		} else {
			if (!connection.unencrypted) {
				missing.push('unencrypted');
			} else {
				for (var i = 0; i < unencryptedFields.length; i++) {
					var field = unencryptedFields[i];
					if (!connection.unencrypted[field]) {
						missing.push(field);
					}
				}
			}

			if (!connection.encrypted) {
				missing.push('encrypted');
			} else {
				for (var i = 0; i < encryptedFields.length; i++) {
					var field = encryptedFields[i];
					if (!connection.encrypted[field]) {
						missing.push(field);
					}
				}
			}
		}

		return missing;
	};

	this.write = function(options, data, response, callback) {

		var responseObj = {
        statusCode : 200,
        id : "",
        ignored: false,
        errors : []//[{code, message}]}
      };
		/*console.log({
			postMapData : options.postMapData,
			data : data
		});*/

		if(data.length > 1){
			return Promise.reject(new Error('More than one record in request, set the export to page size 1')).nodeify(callback);;
		}

		var config = options.configuration || {};
		console.log('SQS Write MessageBody: ', JSON.stringify(data[0].MessageBody));

		var missing = validateConnection(options.connection, [
				'awsAccessKey' ], [ 'secretAccessKey' ]);
		if (missing.length > 0) {
			return Promise.reject(new Error('Missing required parameter(s): '
					+ missing.join(', ')));
		}

		var missing = validateOptions(config);
		if (missing.length > 0) {
			return Promise.reject(new Error(
					'Missing required config read option(s): '
							+ missing.join(', '))).nodeify(callback);;
		}

		var toQueueUrl = config.queueUrl;
		var awsAccessKey = options.connection.unencrypted.awsAccessKey;
		var secretAccessKey = options.connection.encrypted.secretAccessKey;
		var region = options.connection.unencrypted.region || 'us-east-1';

		var sqs = new AWS.SQS({
			credentials : new AWS.Credentials(awsAccessKey, secretAccessKey),
			region : region
		});

		return new Promise(function(fulfill, reject) {
			sqs.sendMessage({
				QueueUrl : toQueueUrl,
				MessageBody : data[0].MessageBody
			}, function(error, result) {

				if (error) {
					/*response.push({
				        statusCode : 422,
				        id : "",
				        ignored: false,
				        errors : [{code: error.code, message: error.message}]//[{code, message}]}
      				});*/
					return reject(error);
				} else {
					console.log('SQS Write Response: ', JSON.stringify(response));
					response.push({
				        statusCode : 200,
				        id : "",
				        ignored: false,
				        errors : []//[{code, message}]}
      				});
					return fulfill(response);
				}
			});
		}).nodeify(callback);

	};
};
