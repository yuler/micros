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
  const { channel_name: projectName, command, text: argsString, response_url } = params
  const args = argsString.split(' ')

  switch (command) {
    case '/gitlab-ci':
      return gitlabCommand(projectName, args, response_url)
  }

  return help
}

const help = `
  Usage: gitlab-ci <command>

  Commnads:

    create <ref> <env> [desciption]   create gitlab ci pipline from the channel as project name

`

function gitlabCommand(projectName, args, response_url) {
  // if args is empty
  if (args.length < 2 || args.includes('help') || args.includes('-h')) {
    return help
  }

  const [ ref, env, description = '' ] = args
  // get projectId
  projectName = projectName.replace('-', '_').toUpperCase()
  const projectId = process.env[projectName]

  // https://docs.gitlab.com/ee/api/pipelines.html#create-a-new-pipeline
  // fetch gitlab api async
  fetch(`https://gitlab.com/api/v4/projects/${projectId}/pipeline?ref=${ref}&variables[][key]=APP_ENV&variables[][value]=${env}&variables[][key]=DESCRIPTION&variables[][value]=${description}`, {
    method: 'POST',
    headers: {
      'Private-Token': GITLAB_TOKEN,
    }
  })
    .then(async response => {
      const res = await response.json()
      console.dir(res)

      if (!res.web_url) return handlerError(res.message)

      fetch(response_url, {
        method: 'POST',
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify({
          response_type: 'in_channel',
          text: 'GitLab pipline create success.',
          attachments: [{
            color: '#008000',
            title: 'GitLab pipline link',
            title_link: res.web_url,
            text: 'Sending delayed responses'
          }]
        })
      })
    .catch(error => {
      handlerError(error)
    })
  })

  return 'Received the command, please wait the api callback.'

  function handlerError(error) {
    fetch(response_url, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify({
        response_type: 'in_channel',
        text: 'GitLab pipline create fail.',
        attachments: [{
          color: '#F00',
          text: JSON.stringify(error)
        }]
      })
    })
  }
}

