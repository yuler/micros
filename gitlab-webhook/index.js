const { send } = require('micro')

const eventMap = {
  'Merge Request Hook': 'merge-request'
}

const { GITLAB_WEBHOOK_SECRET_TOKEN } = process.env

module.exports = async (req, res) => {
  const token = req.headers['x-gitlab-token']
  if (!token || token !== GITLAB_WEBHOOK_SECRET_TOKEN) send(res, 401, 'Unauthorized')

  const event = req.headers['x-gitlab-event']
  if (!eventMap[event]) send(res, 404, `Unsupported event: ${event}`)

  const handler = require(`./${eventMap[event]}`)
  return await handler(req, res)
}
