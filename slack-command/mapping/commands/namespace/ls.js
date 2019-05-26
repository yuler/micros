const fs = require('fs')
const { parse } = require('dotenv')

const { filepath } = require('../../util')
const { notice } = require('../../api')

module.exports = function ls(params, args) {
  const { team_domain, response_url } = params
  const namespace = args._[0]

  const filename = `mapping.${namespace}.${team_domain}.env`
  const path = filepath(filename)

  let text
  let attachments = []
  try {
    const mapping = parse(fs.readFileSync(path))
    text = `File mapping.${namespace}.${team_domain}.env List:`
    attachments = Object.keys(mapping)
      .map(key => ({
        type: 'mrkdwn',
        text: `*\`${key}\`*: ${mapping[key]}`
      }))
  } catch (error) {
    text = `File mapping.${namespace}.${team_domain}.env does not exist`
  }

  notice(response_url, text, attachments)  

  return `\`${params.command} ${params.text}\` command received`
}
