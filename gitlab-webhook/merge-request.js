const path = require('path')
const fs = require('fs')
const { parse } = require('dotenv')
const { json } = require('micro')
const { slackNotifaction } = require('./api')

const { SLACK_WEBHOOK } = process.env

module.exports = async (req, res) => {
  const { user, project, repository, object_attributes } = await json(req)

  const { username: operator } = user
  const { namespace, name } = project
  const { homepage } = repository
  const { action, iid, author_id, assignee_id, title, description, url } = object_attributes

  // mention assignee or author user
  let mention
  // action is open|repone|update
  let descriptionFormated = description
  if (['open', 'reopen', 'update'].includes(action)) {
    mention = generateMention(namespace, assignee_id)
    // format description, is contains mention?
    if (/@[\w]+/g.test(description)) {
      descriptionFormated = description
        .replace(/@all/g, '<!channel>($1)')
        .replace(/@([\w]+)/g, function(origin, username) {
          return `${generateMention(namespace, username)}(${origin})`
        }
      )
    }
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

const filepath = filename => path.resolve(process.cwd(), '.env', filename)

function generateMention(org, userIdOrUsername) {
  let userId = userIdOrUsername
  let username
  let filename
  let mapping
  if (typeof userIdOrUsername === 'string') {
    username = userIdOrUsername
    filename = `mapping.gitlab.${org}.env`
    mapping = parse(fs.readFileSync(filepath(filename)))
    userId = mapping[username]
    if (!userId) return `<!channel>\nThe *${username}* Don't exist in \`${file}\`\nPlease set it\n`
  }

  filename = `mapping.slack.${org}.env`
  mapping = parse(fs.readFileSync(filepath(filename)))
  const mentionId = mapping[userId]
  if (!mentionId) return `<!channel>\nThe *${userId}* Don't exist in \`${file}\`\nPlease set it\n`

  return `<@${mentionId}>`
}
