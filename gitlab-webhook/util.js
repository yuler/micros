const path = require('path')
const fs = require('fs')

const { parse } = require('dotenv')
const filepath = filename => path.resolve(process.cwd(), '.env', filename)

exports.generateMention = function(org, userIdOrUsername) {
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
