const crypto = require('crypto')
const querystring = require('querystring')
const { send, text } = require('micro')
const fetch = require('node-fetch')

const { SLACK_COMMAND_SERCET, GITLAB_TOKEN, PROJECT_MAP } = process.env

if (!SLACK_COMMAND_SERCET || !GITLAB_TOKEN) {
  throw Error('must need env variables `SLACK_COMMAND_SERCET` and `GITLAB_TOKEN`')
}

module.exports = async (req, res) => {
  const signature = req.headers['x-slack-signature']
  if (!signature) return send(res, 401, 'Unauthorized')

  // computed signature
  // https://api.slack.com/docs/verifying-requests-from-slack#a_recipe_for_security
  const timestamp = req.headers['x-slack-request-timestamp']
  const body = await text(req)
  const data = `v0:${timestamp}:${body}`
  const computedSignature = 'v0=' + crypto.createHmac('sha256', SLACK_COMMAND_SERCET)
    .update(data)
    .digest('hex')
  if (signature !== computedSignature) return send(res, 401, 'Unauthorized')

  // handler slack command
  // https://api.slack.com/slash-commands#app_command_handling
  const params = querystring.parse(data)
  const { command, text: argsString } = params
  const args = argsString.split(' ')

  if (command !== '/gitlab-ci') return send(res, 500, 'Error')
  if (/help/gi.test(argsString) || args.length !== 3) return send(res, 200, help)

  const [project, ref, environment] = args
  let id
  if (/^\d+$/.test(project)) {
    id = project
  } else {
    id = JSON.parse(PROJECT_MAP)[project]
  }

  // fetch api
  // https://docs.gitlab.com/ee/api/pipelines.html#create-a-new-pipeline
  const response = await fetch(`https://gitlab.com/api/v4/projects/${id}/pipeline?ref=${ref}&variables[][key]=APP_ENV&variables[][value]=${environment}`, {
    method: 'POST',
    headers: {
      'Private-Token': GITLAB_TOKEN,
    }
  })
  return wrapResponse(`${command} ${argsString}`, await response.json())
}

const help =`
    Usage: gitlab-ci <command>

    gitlab-ci [project name or alias] <ref> <env>          create pipline
  `

function wrapResponse (command, json) {
  console.log(json)
  // const keys = Object.keys(json)
  // const attachments = keys.map(key => {
  //   const value = json[key]
  //   return { text: `${key} : ${value}`}
  // })
  return {
    // "response_type": "in_channel",
    text: command,
    attachments: [{
      text: JSON.stringify(json)
    }]
  }
}
