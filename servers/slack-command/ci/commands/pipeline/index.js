const arg = require('arg')
const subcommands = ['create']

const help = () => `
  Usage ci pipline [options] <command>

  Commands:

    create <ref> <description>     Default subcommand, Create pipeline

  Options:

    -h, --help                     Output usage information
    -e VALUE, ---env=VALUE         Pass to process.env.APP_ENV
    -t VALUE, ---target=VALUE      Pass to process.env.APP_TARGET

  Examples:

    - pipeline create

    $ ci pipline create master description

`

module.exports = async function main(params) {
  const args = arg({
    '--help': Boolean,
    '-h': '--help',

    '--env': String,
    '-e': '--env',

    '--target': String,
    '-t': '--env',
  }, { argv: params.text, permissive: true })

  subcommand = args._.[1]
  if (!subcommands.includes(subcommand)) {
    return `\`${subcommand}\` subcommand does not exist`
  }

  return require(`./${subcommand}`)(params)
}
