const db = require('../lib/db')
const { strict: assert } = require('assert')

/**
 * Helper function to get user by ethereum address
 *
 * @param {string} address Ethereum address of the user
 *
 * @throws if user is not found
 */
let findUserByAddress = async (address) => {
  assert.ok(address, 'missing user address')
  const { rows } = await db.view('doc', 'users', { key: address, include_docs: true })
  if (rows.length === 0) {
    throw new Error('user not found')
  }
  return rows[0].doc
}

/**
 * Helper function to get CouchDB entry of project by ethereum address
 *
 * @param {string} address Ethereum address of the project
 *
 * @throws if project is not found
 */
let findProjectByAddress = async (address) => {
  assert.ok(address, 'missing project address')
  const { rows } = await db.view('doc', 'projects', { key: address, include_docs: true })
  if (rows.length === 0) {
    throw new Error('project not found')
  }
  return rows[0].doc
}

module.exports = { findProjectByAddress, findUserByAddress }
