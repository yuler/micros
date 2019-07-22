const { json } = require('micro')

const { slackNotifaction } = require('./api')
const { generateMention } = require('./util')

module.exports = async (req, res) => {
  const { user, project, repository, object_attributes, merge_request } = await json(req)

  const { username: operator } = user
  const { namespace, name } = project
  const { homepage } = repository
  const { author_id, note, noteable_type, url } = object_attributes

  const action = noteable_type.replace(/(\w+)([A-Z])/g, '$1_$2').toLowerCase()

  let mention
  let title
  let iid
  switch (action) {
    case 'merge_request':
      mention = author_id === merge_request.author_id
        ? generateMention(namespace, merge_request.assignee_id)
        : author_id === merge_request.assignee_id
          ? generateMention(namespace, merge_request.author_id)
          : [generateMention(namespace, merge_request.assignee_id), generateMention(namespace, merge_request.author_id)].join('\n')
      title = `*${merge_request.title}*`
      iid = merge_request.iid
      break
    default:
      return
  }

  const text = [
    mention,
    `${generateMention(namespace, operator)}(${operator}) <${url}|commented on \`${action}\` !${iid}> in <${homepage}|${namespace}/${name}>`,
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

  return await slackNotifaction(namespace, `#${name}`, text, attachments)
}
