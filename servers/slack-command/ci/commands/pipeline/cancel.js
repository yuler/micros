const { pipelineCancel, slackNotifaction } = require('../../api')

module.exports = function ls(params, args) {
  const { team_domain, channel_name, response_url, user_name } = params
  const id = [team_domain, channel_name].join('%2F')

  const [pipelineId] = args._.slice(2)

  if (!pipelineId) if (!ref) return `Miss <pipeline_id> argument`

  pipelineCancel(id, pipelineId)
    .then(async response => {
      const pipeline = await response.json()
      const text = `\`${params.command} ${params.text}\`\nCreated by ${user_name}\nCancel pipeline *\`${pipelineId}\`* successed`
      slackNotifaction(response_url, text)
    })

  return `\`${params.command} ${params.text}\` command received`
}
