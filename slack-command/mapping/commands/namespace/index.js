const arg = require('arg')
const subcommandMap = {
  default: 'set',
  ls: 'ls',
  set: 'set',
  rm: 'rm'
}

const help = namespace =>
`
  Usage mapping ${namespace} [options] <command>

  Commands:

    ls                                      Show mapping ${namespace} list (default)
    set ...<key=value | <key> <value>>      Create/Update mapping for ${namespace}
    rm  ...<key>                            Remove mapping of ${namespace}

  Options:

    -h, --help                              Output usage information

  Examples:

    - Show mapping ${namespace} list

    $ mapping ${namespace} ls

    - Create/Update a pipeline

    $ mapping ${namespace} set a=b c=d

    or

    $ mapping ${namespace} set a b c d

    or 

    $ mapping ${namespace} set a b c=d

`

module.exports = async function main(params) {
  const args = arg({
    '--help': Boolean,
    '-h': '--help',
  }, { argv: params.argv, permissive: true })

  subcommand = subcommandMap[args._[1]]
  if (!subcommand) {
    if (args['--help']) return help(args._[0])
    subcommand = subcommandMap.default
    args.unshift(subcommand)
  }

  return require(`./${subcommand}`)(params, args)
}
