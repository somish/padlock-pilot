/// IMPORTS ///
const { AssertionError, strict: assert } = require('assert')
const ethereumSignatureMiddleware = require('../middleware/auth')
const { resolve } = require('../lib/request')
const { findUserByAddress } = require('../lib/utils')
const db = require('../lib/db')
const mixpanel = require('../lib/mixpanel')
const Router = require('koa-router')
const router = new Router({ prefix: '/api/request' })

/**
 * Project Routes for Padlock v0.1.0
 * @date: 07.25.2020
 * @author: Blox Consulting LLC
 *
 * Routes use to interact with requests
 */

/// PUT HTTP REQUESTS ///

/**
 * Update a request to reflect resolved status, as well as firing other requests if necessary
 *
 * @param {string} requestid - couchdb uuid of the request document being updated to resolved state
 * @param {value} value - number of PUSD tokens transferred by resolving request (OPTIONAL)
 */
router.put('/resolve/:requestid', ethereumSignatureMiddleware, async (ctx) => {
  try {
    let { value } = ctx.request.body
    console.log('value: ', value)
    assert.ok(ctx.params.requestid, 'missing request id')
    let user = await findUserByAddress(ctx.userAddress)
    await resolve(ctx.params.requestid, value, user)
    ctx.status = 202
  } catch (err) {
    ctx.status = err instanceof AssertionError ? 400 : 500
    ctx.body = { error: err.message }
  }
})

/// GET HTTP REQUESTS ///

/**
 * Get all request objects where 'to' is ctx.userAddress
 *
 * @returns {array} requests - returns active and resolved request objectss
 */
router.get('/me', ethereumSignatureMiddleware, async (ctx) => {
  try {
    let user = await findUserByAddress(ctx.userAddress)
    let key = user.role === 'admin' ? user.role : ctx.userAddress
    const { rows } = await db.view('doc', 'requests', { key, include_docs: true })
    let active = rows.filter((request) => request.doc.active)
    active = active.map((request) => request.doc)
    let resolved = rows.filter((request) => !request.doc.active)
    resolved = resolved.map((request) => request.doc)
    ctx.body = { active, resolved }
  } catch (err) {
    ctx.status = 500
    ctx.body = { error: err.message }
  }
})

/**
 * Get all requests fired in a given project
 *
 * @param {string} projectid the deployed address of the project
 * @return { Array } requests - returns json data in active and resolved to represent requests
 */
router.get('/project/:projectid', ethereumSignatureMiddleware, async (ctx) => {
  try {
    let { rows } = await db.view('doc', 'project-requests', { key: ctx.params.projectid, include_docs: true })
    ctx.body = rows.map((response) => response.doc)
  } catch (err) {
    ctx.status = 500
    ctx.body = { error: err.message }
  }
})

/**
 * Get a specific request document according to its id
 * @param requestId - the couchdb uuid being accessed
 * @return a couchdb request document
 */
router.get('/by/:requestId', ethereumSignatureMiddleware, async (ctx) => {
  try {
    ctx.body = await db.get(ctx.params.requestId)
  } catch (err) {
    ctx.status = err instanceof AssertionError ? 400 : 500
    ctx.body = { error: err.message }
  }
})

module.exports = router
