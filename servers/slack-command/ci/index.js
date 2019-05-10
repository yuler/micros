const arg = require('arg')

const commands = ['pipeline']

const help = () => `
  ci [options] <command>

  Command:
    pipeline      [cmd]      Manages gitlab pipeline

  Options:
    -h, --help               Output usage information
`

module.exports = async function main(params) {
  let args = null
  try {
    args = arg({
      '--help': Boolean,
      '-h': '--help',
    },
    { argv: params.text, permissive: true })
  }

  const command = args._.[0]
  if (!command) {
    if (args['--help']) {
      return help()
    }
  }

  if (!commands.includes(command)) {
    return `\`${command}\` command does not exist`
  }

  return require(`./${command}`)(params, args)
}
