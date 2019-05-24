const crypto = require('crypto')
const querystring = require('querystring')

const { send, text } = require('micro')

const slackCommandMap = {
  '/ci': 'ci'
}

const tokens = process.env.SLACK_COMMAND_TOKENS

module.exports = async (req, res) => {
  const body = await text(req)
  const params = querystring.parse(body)

  // valid tokens
  if (!tokens.includes(params.token)) {
    return 'Unauthorized'
  }

  // valid slack command name
  if (!slackCommandMap[params.command]) {
    return `slack command \`${params.command}\` does not exist`
  }

  // handler slack command
  const command = require(`./${slackCommandMap[params.command]}`)
  params.argv = params.text.split(' ')
  return command(params)
}
