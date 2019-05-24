const { json } = require('micro')

module.exports = async (req, res) => {
  const event = req.headers['x-gitlab-event']
  const body = await json(req)

  return 'test'
}
