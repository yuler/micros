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
    attachments = Object.keys(mapping)
      .map(key => ({
        type: 'mrkdwn',
        text: `*\`${key}\`*: ${mapping[key]}`
      }))

    if (attachments.length) text = `File mapping.${namespace}.${team_domain}.env List:`
    else text = `File mapping.${namespace}.${team_domain}.env does not hava any value:`
  } catch (error) {
    text = `File mapping.${namespace}.${team_domain}.env does not exist`
  }

  notice(response_url, text, attachments)  

  return `\`${params.command} ${params.text}\` command received`
}
