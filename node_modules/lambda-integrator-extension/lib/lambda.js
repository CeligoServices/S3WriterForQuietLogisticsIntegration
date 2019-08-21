'use strict'

var Extension = require('integrator-extension')
var lambdaExtension = new Extension()

function createHandler (config) {
  return function (event, context, callback) {
    lambdaExtension.loadConfiguration(config, function (err) {
      if (err) {
        var error = {
          message: err.message,
          code: err.code
        }
        return callback(JSON.stringify({statusCode: 422, errors: [error]}))
      }

      return invokeFunction(event, context, callback)
    })
  }
}

function invokeFunction (event, context, callback) {
  lambdaExtension.callFunction(event, context.clientContext, function (err, result) {
    if (err) return callback(JSON.stringify(err))
    return callback(null, result)
  })
}

exports.createHandler = createHandler
