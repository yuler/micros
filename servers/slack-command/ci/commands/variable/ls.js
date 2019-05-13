const { variableList, slackNotifaction } = require('../../api')

module.exports = function ls(params, args) {
  const { team_domain, channel_name, response_url } = params
  const id = [team_domain, channel_name].join('%2F')

  variableList(id)
    .then(async response => {
      const variables = await response.json()
      const attachments = variables.map(variable => {
        const { key, value } = variable
        return {
          type: 'mrkdwn',
          text: `*\`${key}\`*: ${value}`
        }
      })
      const text = variables.length ? 'Variable List:' : 'Don hava any variable'
      slackNotifaction(response_url, text, attachments)
    })

  return `\`${params.command} ${params.text}\` command received`
}
