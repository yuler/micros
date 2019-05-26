const path = require('path')

exports.filepath = filename => path.resolve(process.cwd(), '.env', filename)