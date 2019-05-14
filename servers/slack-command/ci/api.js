const fetch = require('node-fetch')
const apiRoot = 'https://gitlab.com/api/v4'

const { GITLAB_TOKEN } = process.env

const headers = {
  'Private-Token': GITLAB_TOKEN,
}

// gitlab ci pipeline
// https://docs.gitlab.com/ee/api/pipelines.html
exports.pipelineList = function(id) {
  return fetch(`${apiRoot}/projects/${id}/pipelines?scope=running`, {
    method: 'GET',
    headers
  })
}

exports.pipelineCreate = function(id, ref, variables) {
  return fetch(`${apiRoot}/projects/${id}/pipeline?ref=${ref}&${serialize(variables, 'variables')}`, {
    method: 'POST',
    headers
  })
}

exports.pipelineCancel = function(id, pipelineId) {
  return fetch(`${apiRoot}/projects/${id}/pipelines/${pipelineId}/cancel`, {
    method: 'POST',
    headers
  })
}

exports.pipelineRemove = function(id, pipelineId) {
  return fetch(`${apiRoot}/projects/${id}/pipelines/${pipelineId}`, {
    method: 'DELETE',
    headers
  })
}

exports.pipelineVariable = function(id, pipelineId) {
  return fetch(`${apiRoot}/projects/${id}/pipelines/${pipelineId}/variables`, {
    method: 'GET',
    headers
  })
}

// github ci variable
// https://docs.gitlab.com/ee/api/project_level_variables.html
exports.variableList = function(id) {
  return fetch(`${apiRoot}/projects/${id}/variables`, {
    method: 'GET',
    headers
  })
}

exports.variableCreate = function(id, key, value) {
  return fetch(`${apiRoot}/projects/${id}/variables?key=${key}&value=${value}`, {
    method: 'POST',
    headers
  })
}

exports.variableSet = function(id, key, value) {
  return fetch(`${apiRoot}/projects/${id}/variables/${key}?value=${value}`, {
    method: 'PUT',
    headers
  })
}

exports.variableRemove = function(id, key) {
  return fetch(`${apiRoot}/projects/${id}/variables/${key}`, {
    method: 'DELETE',
    headers
  })
}


// slack
// @ attachments
// https://api.slack.com/tools/block-kit-builder
exports.slackNotifaction = function(response_url, text, attachments = []) {
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

