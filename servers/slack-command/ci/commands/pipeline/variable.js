const { pipelineVariable, slackNotifaction } = require('../../api')

module.exports = function ls(params, args) {
  const { team_domain, channel_name, response_url } = params
  const id = [team_domain, channel_name].join('%2F')

  const [pipelineId] = args._.slice(2)

  if (!pipelineId) if (!ref) return `Miss <pipeline_id> argument`

  pipelineVariable(id, pipelineId)
    .then(async response => {
      const variables = await response.json()
      const attachments = variables.map(variable => {
        const { key, value } = variable
        return {
          type: 'mrkdwn',
          text: `*\`${key}\`*: ${value}`
        }
      })
      const text = variables.length ? 'Pipline variable List:' : 'Pipline don\'t hava any variable'
      slackNotifaction(response_url, text, attachments)
    })

  return `\`${params.command} ${params.text}\` command received`
}
