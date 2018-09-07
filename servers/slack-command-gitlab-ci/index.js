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
  const { channel_name, command, text: argsString, response_url } = params
  const projectName = channel_name.replace('-', '_').toUpperCase()
  const args = argsString.split(' ')
  const _command = args.shift()

  switch (command) {
    case '/gitlab-ci':
      return gitlabCommand(projectName, _command, args, response_url)
  }

  return help
}

const help = `
  Usage: gitlab-ci <command>

  Commands:

    create <ref> <env> [desciption]   create gitlab ci pipline from the channel as project name
    env [operation] [key] [value]    get or set gitlabci environment
`

function gitlabCommand(projectName, command, args, response_url) {
  const commnads = ['create', 'env']

  // if args is empty
  if (!commnads.includes(command) ||
      args.includes('help') ||
      args.includes('-h')
    ) {
    return help
  }

  // get projectId
  const projectId = process.env[projectName]
  switch (command) {
    case 'create':
      return createCommnad()
    case 'env':
      return envCommnad()
  }

  function createCommnad () {
    const [ ref, env, description = '' ] = args

    if (!['testing', 'pre-release', 'production'].includes(env)) {
      return handlerError('The <env> must in testing, pre-release or production.')
    }

    // https://docs.gitlab.com/ee/api/pipelines.html#create-a-new-pipeline
    // fetch gitlab api async
    fetch(`https://gitlab.com/api/v4/projects/${projectId}/pipeline?ref=${ref}&variables[][key]=APP_ENV&variables[][value]=${env}&variables[][key]=DESCRIPTION&variables[][value]=${encodeURIComponent(description)}`, {
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
              title: 'Pipline link',
              title_link: res.web_url,
            }]
          })
        })
      .catch(error => {
        handlerError(error)
      })
    })

    return {
      response_type: 'in_channel',
      text: 'Received the command, please wait the api callback.',
      fields: [
        {
          title: 'Commnad',
          value: `gitlab-ci ${command} ${args.join(' ')}`
        }
      ]
    }

    function handlerError(error) {
      fetch(response_url, {
        method: 'POST',
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify({
          response_type: 'in_channel',
          text: 'create command fail.',
          attachments: [{
            color: '#F00',
            text: JSON.stringify(error),
          }]
        })
      })
    }
  }

  // https://docs.gitlab.com/ee/api/project_level_variables.html
  function envCommnad () {
    const [ operation, key, value ] = args
    if (!operation) {
      getEnvList()
    } else if (!['get', 'set'].includes(operation)) {
      handlerError('The [operation] must in get or set.')
    } else if (!key) {
      handlerError(`The [key] must exist when ${operation}`)
    } else if (operation === 'get') {
      getEnv(key)
    } else if (operation === 'set')  {
      if (!value) return handlerError(`The [value] must exist when key ${operation}`)
      setEnv(key, value)
    }

    return {
      response_type: 'in_channel',
      text: 'Received the command, please wait the api callback.',
      fields: [
        {
          title: 'Commnad',
          value: `gitlab-ci ${command} ${args.join(' ')}`
        }
      ]
    }

    async function getEnvList() {
      try {
        const response = await fetch(`https://gitlab.com/api/v4/projects/${projectId}/variables `, {
          method: 'GET',
          headers: {
            'Private-Token': GITLAB_TOKEN,
          }
        })
        const res = await response.json()
        fetch(response_url, {
          method: 'POST',
          headers: {
            'Content-type': 'application/json'
          },
          body: JSON.stringify({
            response_type: 'in_channel',
            attachments: res.map(variable => {
              return { text: `${variable.key}  ${variable.value}  ${ variable.protected ? 'protected' : ''}`}
            })
          })
        })
      } catch (error) {
        return handlerError(error)
      }
    }

    async function getEnv (key) {
      try {
        const response = await fetch(`https://gitlab.com/api/v4/projects/${projectId}/variables/${key} `, {
          method: 'GET',
          headers: {
            'Private-Token': GITLAB_TOKEN,
          }
        })
        const variable = await response.json()
        fetch(response_url, {
          method: 'POST',
          headers: {
            'Content-type': 'application/json'
          },
          body: JSON.stringify({
            response_type: 'in_channel',
            attachments: [{
              text: `${variable.key}  ${variable.value}  ${ variable.protected ? 'protected' : ''}`
            }]
          })
        })
      } catch (error) {
        return handlerError(error)
      }
    }

    async function setEnv(key, value) {
      try {
        const response = await fetch(`https://gitlab.com/api/v4/projects/${projectId}/variables/${key}?value=${value}`, {
          method: 'PUT',
          headers: {
            'Private-Token': GITLAB_TOKEN,
          }
        })
        const res = await response.json()
        getEnvList()
      } catch (error) {
        return handlerError(error)
      }
    }

    function handlerError(error) {
      console.log(error)
      fetch(response_url, {
        method: 'POST',
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify({
          response_type: 'in_channel',
          text: 'env command fail.',
          attachments: [{
            color: '#F00',
            text: JSON.stringify(error),
          }]
        })
      })
    }

  }
}

