var S3Writer = require('./src/S3Writer');
var SQSReader = require('./src/SQSReader');
var SQSSendMessage = require('./src/SQSSendMessage');
var AWS = require('aws-sdk');
//var ExporterErrorHandler = require('./src/ExporterErrorHandler');
//var Promise = require('bluebird');
//var NoDataError = require('./src/NoDataError');
var obj = {
  hooks: {
    preSaveFunction: function (options, callback) {
      // your code
    }
  },

  wrappers: {
    pingFunction: function (options, callback) {
      // your code
    },
    sendS3: function (options, callback){
      /*
  * The function needs to call back with the following arguments:
 *     err - Error object to convey a fatal error has occurred. This will halt the import process.
 *     response - Response is an array of JSON objects where each object should follow the following structure: 
 {statusCode: 200/401/422, id: string, 
 ignored: boolean, 
 errors: [{code, message}]}. statusCode should be set to 200 when the import was successful, 
 401 when the operation failed with an authorization or connection error and 422 when some other error occurred during the process. 
 id is the identifier of the record in the target system. ignored should set to true if the record was ignored and not imported. 
 errors is an array of JSON objects representing the list of the errors that occurred while importing the records [{message: 'error message', code: 'error code'}]. errors can be used with statusCode 200 as well to indicate partial success, e.g., import succeeded without a field.
 */
      var response = [];
      //console.log('Options: ' + JSON.stringify(options));
 
      var writer = new S3Writer(AWS);
      writer.write(options, options.postMapData, response, callback);
    

    },
    getMessages: function (options, callback){
      /*
 * The function needs to call back with the following arguments:
 *     err - Error object to convey a fatal error has occurred. This will halt the export process.
 *     response - the response should contain a JSON object where following properties can be set. 
          connectionOffline: A boolean value to specify if connection went offline during the course of the export. If set to true this will make the wrapper connection offline and stop the export process. 
          data: An array of values where each value is a record that has been exported. 
          errors: An array of JSON objects where each element represents error information in the format {message: 'error message', code: 'error code'} that occurred during the export. 
          lastPage: A boolean to convey integrator.io that this is the last page of the export process. No more calls will be made once lastPage is set to true. 
          state: An object which can be used to specify the current state of the export process that will be passed back in the next call to the wrapper function.
 */
      
      var response = {
        lastPage : true,
        connectionOffline : false,
        state : {},
        errors : [],
        data : []
      };
    //console.log('Options: ' + JSON.stringify(options));
 
      var reader = new SQSReader(AWS);
      reader.read(options, response, callback);
    

    },
    sendMessage: function (options, callback){
      /*
  * The function needs to call back with the following arguments:
 *     err - Error object to convey a fatal error has occurred. This will halt the import process.
 *     response - Response is an array of JSON objects where each object should follow the following structure: 
 {statusCode: 200/401/422, id: string, 
 ignored: boolean, 
 errors: [{code, message}]}. statusCode should be set to 200 when the import was successful, 
 401 when the operation failed with an authorization or connection error and 422 when some other error occurred during the process. 
 id is the identifier of the record in the target system. ignored should set to true if the record was ignored and not imported. 
 errors is an array of JSON objects representing the list of the errors that occurred while importing the records [{message: 'error message', code: 'error code'}]. errors can be used with statusCode 200 as well to indicate partial success, e.g., import succeeded without a field.
 */
      
      var response = [];
      //console.log('Options: ' + JSON.stringify(options));
 
      var writer = new SQSSendMessage(AWS);
      writer.write(options, options.postMapData, response, callback);
    

    }
  }
}

module.exports = obj