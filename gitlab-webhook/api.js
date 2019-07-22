const fetch = require('node-fetch')

exports.slackNotifaction = function(org, channel, text, attachments = []) {
  const SLACK_WEBHOOK = process.env[`${org}_slack_webhook`.toUpperCase()]
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
