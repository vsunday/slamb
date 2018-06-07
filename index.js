const AWS = require("aws-sdk");
const request = require("request");

function prepare_response(msg) {
    const body = { 'text': msg };
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
        },
        'body': JSON.stringify(body)
    }; 
}

function get_slackparams(event) {
    const body = decodeURIComponent(event.body);
    const params = {};
    body.split('&').forEach(
        (element) => {
            const list = element.split('=');
            params[list[0]] = list[1];
        });
    return params;
}

function deligate_lambda(response_url, function_name, instant_reply='Sure! Just a moment!', callback=callback) {
    const lambda = new AWS.Lambda();
    const lambda_params = {
        FunctionName: function_name,
        InvocationType: 'Event', // Ensures asynchronous execution
        Payload: JSON.stringify({
            response_url: response_url
        })
    };
    
    return lambda.invoke(lambda_params).promise()
    .then(() => callback(null, prepare_response(instant_reply)));
}

// TODO: other than text (e.g. attachment)
function delayed_message(response_url, msg) {
  const options = {
    'url': response_url,
    'headers': {
      'Content-Type': 'application/json'
    },
      'body': JSON.stringify({'text': msg})
  };
  return request(options, (error, response, body) => {
    if (error) throw error;
  });
}

module.exports = {
  'prepare_response': prepare_response,
  'get_slackparams': get_slackparams,
  'deligate_lambda': deligate_lambda,
  'delayed_message': delayed_message
};