const commandMap = require('./commands')

const help = () =>
`
  ci [options] <command>

  Command:
    pipeline          [cmd]                 Manages gitlab ci pipeline
    variable | var    [cmd]                 Manages gitlab ci environment variable

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
