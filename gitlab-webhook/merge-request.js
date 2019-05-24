const { json } = require('micro')
const { slackNotifaction } = require('./api')

const { SLACK_WEBHOOK } = process.env

module.exports = async (req, res) => {
  const { user, project, repository, object_attributes, labels } = await json(req)

  const { username: operator } = user
  const { namespace, name } = project
  const { homepage } = repository
  const { action, iid, author_id, assignee_id, title, description, url } = object_attributes

  // mention assignee or author user
  let mention
  // action is open|repone|update, format description, is contains mention?
  let descriptionFormated = description
  if (['open', 'reopen', 'update'].includes(action) && /@[\w]+/g.test(description)) {
    mention = generateMention(namespace, assignee_id)
    descriptionFormated.replace(/@all/g, '<!channel>($1)')
    descriptionFormated.replace(/@([\w]+)/g, function(origin, username) {
      return generateMention(namespace, username)(${origin})
    })
  } else {
    mention = generateMention(namespace, author_id)
  }

  const text = [
    mention,
    `${generateMention(namespace, operator)}(${operator}) \`${action}\` <${url}|!${iid} *${title}*> in <${homepage}|${namespace}/${name}>`,
    descriptionFormated
  ].join('\n')

  return await slackNotifaction(SLACK_WEBHOOK, `#${name}`, text)
}

function getEnvKey(org, userIdOrUsername) {
  return `GITLAB_${org.toUpperCase()}_${userIdOrUsername.toString().toUpperCase()}`
}

function generateMention(org, userIdOrUsername) {
  let userId = userIdOrUsername
  let username
  let key
  if (typeof userIdOrUsername === 'string') {
    id = null
    username = userIdOrUsername
  }

  if (userId) {
    key = getEnvKey(org, userId)
    username = process.env[key]
    if (!username) return `<!channel>\nDon't exist *${key}* in environment\nPlease set it`
  }

  key = getEnvKey(org, username)
  const mentionId = process.env[key]
  if (!mentionId) return `<!channel>\nDon't exist *${key}* in environment\nPlease set it`

  return `<@${mentionId}>`
}
