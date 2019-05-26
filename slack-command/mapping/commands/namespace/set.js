const fs = require('fs')
const { parse } = require('dotenv')

const { filepath } = require('../../util')
const { notice } = require('../../api')

module.exports = function set(params, args) {
  const { team_domain, response_url } = params
  const namespace = args._[0]
  const _ = args._.slice(2)

  // valid
  if (_.length < 1) {
    return `Must need a <key>`
  }

  const filename = `mapping.${namespace}.${team_domain}.env`
  const path = filepath(filename)
  let mapping = {}
  if (fs.existsSync(path)) {
    mapping = parse(fs.readFileSync(path))
  }
  // parse args
  for (let i = 0; i < _.length; i++) {
    if (_[i].includes('=')) {
      const [key, value] = _[i].split('=', 2)
      mapping[key] = value
      continue
    }
    mapping[_[i]] = _[++i]
  }

  // save
  fs.writeFileSync(filepath(filename), Object.keys(mapping).map(key => `${key}=${mapping[key]}\n`).join(''))

  const text = `Set Successed\nFile mapping.${namespace}.${team_domain}.env List:`
  const attachments = Object.keys(mapping)
    .map(key => `*\`${key}\`*: ${mapping[key]}`)
  notice(response_url, text, attachments)

  return `\`${params.command} ${params.text}\` command received`
}
