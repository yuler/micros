const { pipelineList, slackNotifaction } = require('../../api')

module.exports = function ls(params, args) {
  const { team_domain, channel_name, response_url } = params
  const id = [team_domain, channel_name].join('%2F')

  pipelineList(id)
    .then(async response => {
      const pipelines = await response.json()
      const attachments = pipelines.map(pipeline => {
        const { id, sha, ref, status, web_url } = pipeline
        return {
          type: 'mrkdwn',
          text:
            `*id*: ${id} *sha*: ${sha} *ref*: ${ref}\n` +
            `*status*: ${status} <${web_url}|pipeline link>`,
        }
      })
      const text = pipelines.length ? 'Running pipeline List:' : 'No pipeline is running'
      slackNotifaction(response_url, text, attachments)
    })

  return `\`${params.command} ${params.text}\` command received`
}
