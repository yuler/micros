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
  // action is open or repone, format description, is contains mention?
  let descriptionFormated = description
  if (action.includes('open') && /@[\w]+/g.test(description)) {
    mention = generateMentionAssignee(namespace, assignee_id)
    descriptionFormated.replace(/@all/g, '<!channel>($1)')
    descriptionFormated.replace(/@([\w]+)/g, function(origin, username) {
      const mentionId = process.env[getEnvKey(namespace, username)]
      return mentionId ? `<@${mentionId}>(${origin})` : origin
    })
  } else {
    mention = generateMentionAssignee(namespace, author_id)
  }

  const text = [
    mention,
    `${generateMentionAssignee()}(${operator}) \`${action}\` <${url}|!${iid} *${title}*> in <${homepage}|${namespace}/${name}>`,
    descriptionFormated
  ].join('\n')

  return await slackNotifaction(SLACK_WEBHOOK, `#${name}`, text)
}

function getEnvKey(org, username) {
  return `GITLAB_${org.toUpperCase()}_${username.toUpperCase()}`
}

function generateMentionAssignee(org, userId)  {
  if (!userId) return `<!channel>\nAssignee None`

  userId = userId.toString()
  const username = process.env[getEnvKey(org, userId)]
  if (!username) {
    return `<!channel>\nDon't exist *${username}* in environment\nPlease set it`
  }

  const mentionId = process.env[getEnvKey(org, username)]
  if (!mentionId) {
    return `<!channel>\nDon't exist *${mentionId}* in environment\nPlease set it` 
  }

  return `<@${mentionId}>`
}
