const arg = require('arg')
const subcommandMap = {
  default: 'ls',
  create: 'create',
  add: 'create',
}

const help = () => `
  Usage ci pipline [options] <command>

  Commands:

    ls                                      Show running pipeline list (default)
    create | add <ref> [description]        Create pipeline use git commit <ref>

  Options:

    -h, --help                              Output usage information
    -v key:value, --variable=key:value      Pass value to process.env[key]
    -e key:value, --env=key:value           Pass value to process.env[key]

  Examples:

    - Show pipeline running list

    $ ci pipeline ls

    - Create a pipeline

    $ ci pipline create master description -v APP_ENV:testing --variable=APP_VERSION:1.0.0

    or

    $ ci pipline add master description -e APP_ENV:testing --env=APP_VERSION:1.0.0

`

module.exports = async function main(params) {
  const args = arg({
    '--help': Boolean,
    '-h': '--help',

    '--variable': [String],
    '-v': '--variable',
    '--env': '--variable',
    '-e': '--variable',
  }, { argv: params.argv, permissive: true })

  subcommand = subcommandMap[args._[1]]
  if (!subcommand) {
    if (args['--help']) return help()
    subcommand = subcommandMap.default
  }

  return require(`./${subcommand}`)(params, args)
}
