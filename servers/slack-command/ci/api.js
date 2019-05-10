const fetch = require('node-fetch')
const apiRoot = 'https://gitlab.com/api/v4'

const { GITLAB_TOKEN } = process.env

const gitlabHeaders = {
  'Private-Token': GITLAB_TOKEN,
}

// gitlab pipeline
// https://docs.gitlab.com/ee/api/pipelines.html
exports.pipelineList = function(id) {
  return fetch(`${apiRoot}/projects/${id}/pipelines?scope=running`, {
    method: 'GET',
    headers: gitlabHeaders
  })
}
exports.pipelineCreate = function(id, ref, variables) {
  console.log(`${apiRoot}/projects/${id}/pipeline?ref=${ref}&${serialize(variables, 'variables')}`)
  return fetch(`${apiRoot}/projects/${id}/pipeline?ref=${ref}&${serialize(variables, 'variables')}`, {
    method: 'POST',
    headers: gitlabHeaders
  })
}

// slack
// @ attachments
// https://api.slack.com/tools/block-kit-builder
exports.slackNotifaction = function(response_url, text, attachments) {
  return fetch(response_url, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json'
    },
    body: JSON.stringify({
      text,
      attachments,
      response_type: 'in_channel',
    })
  })
}

// helps
function serialize(obj, name) {
  return Object.keys(obj)
    .reduce((acc, key) => {
      acc += `&${name}[][key]=${key}&${name}[][value]=${obj[key]}`
      return acc
    }, '').slice(1)
}

