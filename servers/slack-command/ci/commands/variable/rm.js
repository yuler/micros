const { variableRemove, slackNotifaction } = require('../../api')

module.exports = function ls(params, args) {
  const { team_domain, channel_name, response_url } = params
  const id = [team_domain, channel_name].join('%2F')

  const [key] = args._.slice(2)

  if (!key) return `Miss <key> argument`

  variableRemove(id, key)
    .then(async response => {
      const data = await response.text()
      // @TODO
      console.log(data)
      const text = `\`${params.command} ${params.text}\`\nRemove variable *\`${key}\`* successed`
      slackNotifaction(response_url, text)
    })

  return `\`${params.command} ${params.text}\` command received`
}
