const { json } = require('micro')

const { slackNotifaction } = require('./api')
const { generateMention } = require('./util')

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
  ].join('\n')

  const attachments = [{
    type: 'mrkdwn',
    text: descriptionFormated
  }]

  return await slackNotifaction(namespace, `#${name}`, text, attachments)
}


