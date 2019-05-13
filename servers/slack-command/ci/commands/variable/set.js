const { variableSet, slackNotifaction } = require('../../api')

module.exports = function ls(params, args) {
  const { team_domain, channel_name, response_url } = params
  const id = [team_domain, channel_name].join('%2F')

  const [key, value] = args._.slice(2)

  if (!key) return `Miss <key> argument`
  if (!value) return `Miss <value> argument`

  variableSet(id, key)
    .then(async response => {
      const variable = await response.json()
      const { key , value } = variable
      const attachments = [{
        type: 'mrkdwn',
        text: `\`*${key}*\`: ${value}`
      }]
      const text = `Set variable \`*${key}*\` successed`
      slackNotifaction(response_url, text, attachments)
    })

  return `\`${params.command} ${params.text}\` command received`
}
