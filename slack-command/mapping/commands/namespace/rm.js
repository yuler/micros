const fs = require('fs')
const { parse } = require('dotenv')

const { filepath } = require('../../util')
const { notice } = require('../../api')

module.exports = function rm(params, args) {
  const { team_domain, response_url } = params
  const namespace = args._[0]
  const keys = args._.slice(2)

  // valid
  if (keys.length < 0) {
    return `Miss <key> argument`
  }

  const filename = `mapping.${namespace}.${team_domain}.env`
  const path = filepath(filename)
  let mapping = {}
  if (fs.existsSync(path)) {
    mapping = parse(fs.readFileSync(path))
  }

  keys.forEach(key => {
    delete mapping[key]
  })

  // save
  fs.writeFileSync(filepath(filename), Object.keys(mapping).map(key => `${key}=${mapping[key]}\n`).join(''))

  let text
  const attachments = Object.keys(mapping)
    .map(key => ({
      type: 'mrkdwn',
      text: `*\`${key}\`*: ${mapping[key]}`
    }))
  if (attachments.length) text = `File mapping.${namespace}.${team_domain}.env List:`
  else text = `File mapping.${namespace}.${team_domain}.env does not hava any value`
    
  notice(response_url, text, attachments)

  return `\`${params.command} ${params.text}\` command received`
}
