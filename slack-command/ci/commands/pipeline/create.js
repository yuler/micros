const { pipelineCreate, slackNotifaction } = require('../../api')

module.exports = async function add(params, args) {
  const { team_domain, channel_name, response_url, user_name } = params
  const id = [team_domain, channel_name].join('%2F')

  const [ref, description] = args._.slice(2)

  if (!ref) return `Miss <ref> argument`

  const variables = {}
  ;(args['--variable'] || []).map(str => {
    const [key, value] = str.split('=')
    if (key && value) {
      // remove <url> => url
      variables[key] = value.replace(/^<|>$/g, '')
    }
  })

  if (description) {
    variables['DESCRIPTION'] = encodeURIComponent(description)
  }

  pipelineCreate(id, ref, variables)
    .then(async response => {
      const pipeline = await response.json()
      const { id, sha, ref, status, web_url } = pipeline

      const attachments = [{
        type: 'mrkdwn',
        text:
          `*id*: ${id} *sha*: ${sha} *ref*: ${ref}\n` +
          `*status*: ${status} <${web_url}|pipeline link>`,
      }]

      slackNotifaction(response_url, `\`${params.command} ${params.text}\`\nCreated by ${user_name}\nPipeline create successed.`, attachments)
    })

  return `\`${params.command} ${params.text}\` command received`
}
