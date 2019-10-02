var Credentials = require('aws-sdk').Credentials;
var Promise = require('bluebird');

module.exports = function S3Writer(AWS) {

	var REQUIRED_OPTIONS = [ 'bucket'];

	var validateOptions = function(options) {

		if (!options) {
			return REQUIRED_OPTIONS;
		}

		var missing = [];

		for (var i = 0; i < REQUIRED_OPTIONS.length; i++) {
			var option = REQUIRED_OPTIONS[i];
			if (!options[option]) {
				missing.push(option);
			}
		}

		return missing;

	};

	this.write = function(options, data, response, callback) {
		var config = options.configuration || {};
		var missing = validateOptions(config);
		if (missing.length > 0) {
			return Promise.reject(new Error(
					'Missing required config write option(s): '
							+ missing.join(', ')));
		}

		var params = {
			Bucket : config.bucket,
			Key : data[0].fileName,/*handlebars.compile(config.write.options.key || '{{now}}.txt')
					({
						now : new Date().toISOString()
					}),*/
			Body : data[0].contents,
			ContentType : config.contentType || 'text/plain'
		};
		var awsAccessKey = options.connection.unencrypted.awsAccessKey;
		var secretAccessKey = options.connection.encrypted.secretAccessKey;
		var region = options.connection.unencrypted.region || 'us-east-1';

		options.documentName = params.Key;

		if (config.logData) {
			console.log('S3 writer body: ', JSON.stringify(data[0]));
			console.log('S3 params: ', JSON.stringify(params));
		}
		var s3 = new AWS.S3({
			credentials : new AWS.Credentials(awsAccessKey, secretAccessKey),
			region : region
		});

		return new Promise(function(fulfill, reject) {
			s3.putObject(params, function(error, result) {

				if (error) {
					/*response.push({
				        statusCode : 422,
				        id : "",
				        ignored: false,
				        errors : [{code: error.code, message: error.message}]//[{code, message}]}
      				});*/
      				console.log(error, error.stack);
					return reject(error);
				} else {
					console.log('S3 Write Response: ', JSON.stringify(result));
					response.push({
				        statusCode : 200,
				        id : params.Key,
				        ignored: false,
				        errors : []//[{code, message}]}
      				});
					return fulfill(response);
				}
			});
		}).nodeify(callback);

		//return s3.putObjectAsync(params).nodeify(callback);

	};

};