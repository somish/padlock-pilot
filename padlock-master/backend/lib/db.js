const nano = require('nano')(process.env.COUCHDB_SECRET_URL)

module.exports = nano.db.use('padlock-dev')
