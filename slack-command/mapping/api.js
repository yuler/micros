const fetch = require('node-fetch')

// https://api.slack.com/tools/block-kit-builder
exports.notice = function(response_url, text, attachments = []) {
  return fetch(response_url, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json'
    },
    body: JSON.stringify({
      text,
      attachments,
      response_type: 'in_channel',
    })
  })
}