const commandMap = require('./commands')

const help = () =>
`
  mapping [options] <command>

  Command:
    gitlab            [cmd]                 Mapping for gitlab
    slack             [cmd]                 Mapping for slack

  Options:
    -h, --help                              Output usage information
`

module.exports = async function main(params) {
  const command = params.argv[0]

  if (['-h', '--help'].includes(command) ||
    params.text.trim() === '') {
    return help()
  }

  if (command && !commandMap[command]) {
    return `ci \`${command}\` command does not exist`
  }

  return require(`./commands/${commandMap[command]}`)(params)
}
