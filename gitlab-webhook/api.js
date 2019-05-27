const fetch = require('node-fetch')
const { SLACK_WEBHOOK } = process.env

exports.slackNotifaction = function(channel, text, attachments = []) {
  return fetch(SLACK_WEBHOOK, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json'
    },
    body: JSON.stringify({
      channel,
      text,
      attachments,
      username: 'GitLab'
    })
  })
}
