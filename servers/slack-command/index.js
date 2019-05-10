const crypto = require('crypto')
const querystring = require('querystring')

const { send, text } = require('micro')
const arg = require('arg')

const slackCommands = ['/ci']

module.exports = async (req, res) => {
  // valid signature
  const success = await validSignature(req)
  if (!success) return send(res, 401, 'Unauthorized')

  // handler slack command
  // https://api.slack.com/slash-commands#app_command_handling
  const body = await text(req)
  const params = querystring.parse(body)

  if (!slackCommands.includes(params.command)) {
    return send(res, 404, `\`${params.command}\` slack command does not exist`)
  }

  const command = require(`.${params.command}`)
  return command(params)
}

// valid signature
// https://api.slack.com/docs/verifying-requests-from-slack#a_recipe_for_security
async function validSignature(req) {
  const signature = req.headers['x-slack-signature']
  if (!signature) return false

  const timestamp = req.headers['x-slack-request-timestamp']
  const body = await text(req)
  const data = `v0:${timestamp}:${body}`
  const _signature = 'v0=' + crypto.createHmac('sha256', SLACK_COMMAND_SERCET)
    .update(data)
    .digest('hex')

  return signature === _signature
}
