# lambda-integrator-extension
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

This module extends [integrator-extension](https://github.com/celigo/integrator-extension) and can be used to host extension functions on [AWS Lambda](http://docs.aws.amazon.com/lambda/latest/dg/welcome.html). This allows to run the extension code in a server-less environment that helps in simplifying the deployment and maintenance process. To use this module your stack must be of type lambda in integrator.io. integrator.io uses the AWS [IAM User](http://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html) Access Keys
provided on the stack to invoke the extension functions and get the results. The associated AWS IAM user must be assigned "lambda:InvokeFunction" permission for the AWS Lambda Function provided on the stack via an attached [IAM policy](http://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_managed-vs-inline.html?icmpid=docs_iam_console). Detailed steps to create an AWS Lambda stack in integrator.io are given [below](#getting-started).

## Installation

Using npm:
```
$ npm i --save lambda-integrator-extension
```

## Usage

```js
var lambdaExtension = require('lambda-integrator-extension')

exports.handler = lambdaExtension.createHandler(config)
```

### createHandler(callback)

createHandler function loads the [configuration](https://github.com/celigo/integrator-extension#configuration) and returns the handler that should be used when creating the AWS Lambda Function. The result of execution of createHandler function needs
to be assigned to exports.handler which in turn will be executed whenever integrator.io sends a request to execute any of the extension functions.

## Getting Started

Given below are the complete steps to create a working AWS Lambda stack.

1. Create an [AWS account](http://aws.amazon.com/). As part of the sign-up validation procedure you will receive a phone call.
2. Create an [IAM Policy](http://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_managed-vs-inline.html?icmpid=docs_iam_console)
    1. Go to Identity And Access Management page by clicking "Security Credentials" from the drop down under your account name.
    2. On the navigation column on the left, choose "Policies".
    3. Click the "Create Policy" button present at the top of the page.
    4. On the "Create Policy" page, select "Create Your Own Policy" option.
    5. Give an appropriate name for the policy in name field.
    6. Add the following in the policy document text box:

  	    ```javascript
        {
            "Version": "2012-10-17",
            "Statement": [{
                "Effect": "Allow",
                "Action": [
                    "lambda:InvokeFunction"
                ],
                "Resource": [
                    "*"
                ]
            }]
        }
        ```
    7. To validate the policy click on "Validate Policy" button.
    8. If the validation passes then click on "Create Policy" button.
3. Create an [IAM User](http://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html) in AWS
    1. Go to Identity And Access Management page.
    2. Select "Users" in the left pane.
    3. On the "Create Users" page enter the user name.
    4. Ensure that "Generate an access key for each user" option is checked.
    5. Click on the Create button.
    6. Click on "Show User Security Credentials" and make a note of the "Access Key ID" and "Secret Access Key".
    7. Go to the Permissions tab for the user and attach the policy created above.
4. Write code
    1. Run "npm init" to create node project in a new folder.
    2. Run "npm i --save lambda-integrator-extension".
    3. Create a new file functions.js and save the following [extension functions](https://github.com/celigo/integrator-extension#extension-functions) in it.
        ```javascript
        var obj = {
          hooks: {
            preSaveFunction: function (options, callback) {
              // your code
            }
          },

          wrappers: {
            pingFunction: function (options, callback) {
              // your code
            }
          }
        }

        module.exports = obj
        ```
    4. Create a new file index.js and save the following code in it. Either the DIY or connectors [configuration](https://github.com/celigo/integrator-extension#configuration) should be used.
        ```javascript
        var extension = require('lambda-integrator-extension');
        var functions = require('./functions');

        var options = { diy: functions };
        // var options = { connectors: { _connectorId: functions } }; // for connectors
        exports.handler = extension.createHandler(options);
        ```
    5. Create a zip of the project folder with an archiving utility. It should have package.json, index.js, functions.js and node_modules in it.
5. Create a [Lambda function](http://docs.aws.amazon.com/lambda/latest/dg/getting-started-create-function.html) on AWS
    1. Go to Lambda through Amazon web services dashboard.
    2. Click on Create a Lambda Function.
    3. On the select blueprint page click on skip button.
    4. Click on next button on configure triggers page.
    5. Provide a name for the function.
    6. Select runtime environment as Node.js 8.10.
    7. In the Lambda function code section select code entry type as Upload a .ZIP file.
    8. Click on the upload button to upload the zip file that was created earlier.
    9. Set handler to 'index.handler'.
    10. Select Choose an existing role in the role field.
    11. Select the default "lambda_basic_execution" role in the existing role field.
    12. In the advanced settings section update memory based on your requirement and choose timeout as 300 seconds.
    13. Let the VPC field be set to No VPC.
    14. Click on next button.
    15. Review the configuration and click on Create Function button.
6. Create a stack in integrator.io
    1. Login into integrator.io.
    2. Click on options field present at the top right corner and select stacks.
    3. Click on the New Stack button.
    4. Give an appropriate name for the stack.
    5. Select type as AWS Lambda.
    6. Update the Access Key Id, Secret Access Key and AWS Region with the IAM User's properties that you saved earlier.
    7. Set the function name to the function name of the AWS Lambda function that was created.
    8. Click on the save button.

Now, the stack is ready for use and it can be referenced from appropriate exports, imports and connections. The steps above list out the bare minimum setup required to run an AWS Lambda stack. It is recommended that the permissions and other [settings](http://docs.aws.amazon.com/lambda/latest/dg/lambda-app.html) be customized as per your own requirements and controls.
