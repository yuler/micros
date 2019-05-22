const { variableRemove, slackNotifaction } = require('../../api')

module.exports = function ls(params, args) {
  const { team_domain, channel_name, response_url } = params
  const id = [team_domain, channel_name].join('%2F')

  // valid
  if (!args._.length) {
    return `Miss <key> argument`
  }

  const keys = args._.slice(2)

  Promise.all(keys.map(async key => {
    const response = await variableRemove(id, key)
    return response.text()
  })).then(responseList => {
    const _keys = keys.map(key => `*\`${key}\`*`)
    const text = `\`${params.command} ${params.text}\`\nRemove variable ${_keys.join(' ')} successed`
    slackNotifaction(response_url, text)
  })

  return `\`${params.command} ${params.text}\` command received`
}
