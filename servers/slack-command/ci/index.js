const commandMap = require('./commands')

const help = () => `
  ci [options] <command>

  Command:
    pipeline      [cmd]      Manages gitlab pipeline

  Options:
    -h, --help               Output usage information
`

module.exports = async function main(params) {
  const command = params.argv[0]

  if (!command) {
    if (params.argv.includes['-h'] || params.argv.includes['--help']) {
      return help()
    }
  }

  if (command && !commandMap[command]) {
    return `ci \`${command}\` command does not exist`
  }

  return require(`./commands/${command}`)(params)
}
