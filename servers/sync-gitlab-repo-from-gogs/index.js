const crypto = require('crypto')
const { send, json } = require('micro')
const fetch = require('node-fetch')

const { GOGS_WEBHOOK_SERCET, GITLAB_TOKEN } = process.env

if (!GOGS_WEBHOOK_SERCET || !GITLAB_TOKEN) {
  throw Error('must need env variables `GOGS_WEBHOOK_SERCET` and `GITLAB_TOKEN`')
}

module.exports = async (req, res) => {
  const signature = req.headers['x-gogs-signature']
  if (!signature) {
    return send(res, 401, 'Unauthorized')
  }

  const computedSignature = crypto.createHmac('sha256', GOGS_WEBHOOK_SERCET)
    .update(JSON.stringify(await json(req), null, 2))
    .digest('hex')

  if (signature !== computedSignature) {
    return send(res, 401, 'Unauthorized')
  }

  // /:id get id
  const mather = /^\/(\d+)/.exec(req.url)
  if (!matcher) {
    return send(res, 422, 'Unprocessable Entity')
  }

  const id = matcher[id]
  const headers = { 'Private-Token': GITLAB_TOKEN }
  const response = await fetch(`https://gitlab.com/api/v4/projects/${projectId}/mirror/pull`, {
    method: 'POST',
    headers
  })
  return await response.json()
}
