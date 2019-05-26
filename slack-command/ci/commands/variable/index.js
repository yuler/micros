const arg = require('arg')
const subcommandMap = {
  default: 'ls',
  ls: 'ls',
  set: 'set',
  rm: 'rm',
}

const help = () =>
`
  Usage ci variable [options] <command>

  Commands:

    ls                                      Show environment variable list
    set ...<key=value | <key> <value>>      Create/Update a or multiple environment variable
    rm  ...<key>                            Remove a or multiple environment variable

  Options:

    -h, --help                              Output usage information

  Examples:

    - Show all environment variables

    $ ci variable ls

    - Create/Update a environment variable

    $ ci variable set APP_ENV testing

    - Create/Update multiple environment variable

    $ ci variable set APP_ENV testing APP_VERSION 7.5.0

    - Remove a environment variable

    $ ci variable rm APP_ENV

    - Remove multiple environment variable

    $ ci variable rm APP_ENV APP_VERSION

`

module.exports = async function main(params) {
  const args = arg({
    '--help': Boolean,
    '-h': '--help',
  }, { argv: params.argv, permissive: true })

  subcommand = subcommandMap[args._[1]]
  if (!subcommand) {
    if (args['--help']) return help()
    subcommand = subcommandMap.default
  }

  return require(`./${subcommand}`)(params, args)
}
