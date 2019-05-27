const { json } = require('micro')

const { slackNotifaction } = require('./api')
const { generateMention } = require('./util')

module.exports = async (req, res) => {
  const { user, project, repository, object_attributes } = await json(req)

  const { username: operator } = user
  const { namespace, name } = project
  const { homepage } = repository
  const { author_id, note, noteable_type, url } = object_attributes

  const action = noteable_type.replace(/(\w+)([A-Z])/g, '$1 $2').toUpperCase()
  const mention = generateMention(namespace, author_id)
  const title = object_attributes[action] ? `*${object_attributes[action].title}*` : ''
  const text = [
    mention,
    `${generateMention(namespace, operator)}(${operator}) <${url}|commented on \`${}\` !${iid}> in <${homepage}|${namespace}/${name}>`,
    title
  ].join('\n')

  let noteFormated = note
  if (/@[\w]+/g.test(note)) {
    noteFormated = note
      .replace(/@all/g, '<!channel>($1)')
      .replace(/@([\w]+)/g, function(origin, username) {
        return `${generateMention(namespace, username)}(${origin})`
      }
    )
  }
  const attachments = [{
    type: 'mrkdwn',
    text: `${noteFormated}`
  }]

  return await slackNotifaction(`#${name}`, text, attachments)
}
