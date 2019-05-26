const { variableSet, variableCreate, slackNotifaction } = require('../../api')

module.exports = function ls(params, args) {
  const { team_domain, channel_name, response_url } = params
  const id = [team_domain, channel_name].join('%2F')
  const _ = args._.slice(2)

  // valid
  if (_.length < 1) {
    return `Miss <key=value | <key> <value>> argument: ${args._.join(' ')}`
  }

  // pairs
  const pairs = []
  for (let i = 0; i < _.length; i++) {
    if (_[i].includes('=')) {
      pairs.push(..._.split('=', 2))
      continue
    }
    pairs.push(_[i])
    pairs.push(_[++i])
  }

  Promise.all(pairs.map(async pair => {
    const [key, value] = pair
    let response = await variableSet(id, key, value)
    if (response.status === 404) {
      response = await variableCreate(id, key, value)
    }
    return await response.json()
  })).then(variableList => {
    const attachments = variableList.map(variable => {
      const { key , value } = variable
      return {
        type: 'mrkdwn',
        text: `*\`${key}\`*: ${value}`
      }
    })
  }).then(attachments => {
    const keys = pairs.map(pair => `*\`${pair[0]}\`*`)
    const text = `\`${params.command} ${params.text}\`\nSet variable ${keys.join(' ')} successed`
    slackNotifaction(response_url, text, attachments)
  })

  return `\`${params.command} ${params.text}\` command received`
}
