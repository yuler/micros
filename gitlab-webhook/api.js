const fetch = require('node-fetch')

exports.slackNotifaction = function(webhook, channel, text) {
  return fetch(webhook, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json'
    },
    body: JSON.stringify({
      channel,
      text,
      username: 'GitLab'
    })
  })
}
