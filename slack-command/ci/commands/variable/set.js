const { variableSet, variableCreate, slackNotifaction } = require('../../api')

module.exports = function ls(params, args) {
  const { team_domain, channel_name, response_url } = params
  const id = [team_domain, channel_name].join('%2F')

  // valid
  if (args._.length === 0 || args._.length % 2 !== 0) {
    return `Argument does not a or multiple pair. argument: ${args._.join(' ')}`
  }

  // chunk array
  const pairs = args._.slice(2).reduce((arr, item, idx) => {
    return idx % 2 === 0
      ? [...arr, [item]]
      : [...arr.slice(0, -1), [...arr.slice(-1)[0], item]]
  }, [])

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
