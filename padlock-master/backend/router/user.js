/// IMPORTS ///
const { AssertionError, strict: assert } = require('assert')
const upload = require('../middleware/upload')
const ethereumSignatureMiddleware = require('../middleware/auth')
const db = require('../lib/db')
const mixpanel = require('../lib/mixpanel')
const { findUserByAddress } = require('../lib/utils')
const { faucet } = require('../lib/blockchain')
const { make } = require('../lib/request')
const Router = require('koa-router')
const unparsed = require('koa-body/unparsed')
const router = new Router({ prefix: '/api/user' })

/**
 * Project Routes for Padlock v0.1.0
 * @date: 07.25.2020
 * @author: Blox Consulting LLC
 *
 * Routes use to interact with users
 */

/// POST HTTP REQUESTS ///

/**
 * Register a user
 *
 * @todo handle eth enrollment
 *
 * @param {string} name - Name of the user
 * @param {string} email - Email address of the user
 * @returns {string} streetAddress - Street address number of the user
 * @param {string} invitationId - Id of the invitation for the user
 *
 * @returns {string} userId - Id of the registered user
 */
router.post('/', ethereumSignatureMiddleware, async (ctx) => {
  try {
    const { name, email, streetAddress, invitationId, imagePayload } = ctx.request.body
    assert.ok(name, 'missing name')
    assert.ok(streetAddress, 'missing address')
    assert.ok(email, 'missing email')
    assert.ok(invitationId, 'missing invitation id')

    const { email: invitationEmail, role, inviter } = await db.get(invitationId)
    const { id: userId, rev } = await db.insert({
      type: 'user',
      name,
      email,
      streetAddress,
      role,
      address: ctx.userAddress,
      inviter,
    })
    if (imagePayload) {
      let decodedFile = Buffer.from(imagePayload.file, 'base64')
      await db.attachment.insert(userId, 'profile.jpg', decodedFile, imagePayload.type, { rev })
    }
    let requestCode = {
      admin: 'admin_joined',
      owner: 'owner_joined',
      gc: 'gc_joined',
      sc: 'sc_joined',
    }[role]
    if (role == 'admin' || role == 'owner') make(requestCode, 'admin', ctx.userAddress)
    else make(requestCode, inviter, ctx.userAddress)
    mixpanel.track('user_register', { distinct_id: ctx.userAddresss })

    ctx.status = 201
    ctx.body = { userId }
  } catch (err) {
    ctx.status = err instanceof AssertionError ? 400 : 500
    ctx.body = { error: err.message }
  }
})

/**
 * Store a user's photo
 *
 * @param {File} photo - Uploaded photo
 */
router.post('/photo', upload({ limit: '10mb' }), ethereumSignatureMiddleware, async (ctx) => {
  try {
    const { _id, _rev } = await findUserByAddress(ctx.userAddress)
    const filedata = ctx.request.body[unparsed]
    await db.attachment.insert(_id, 'profile.jpg', filedata, 'image/jpeg', { rev: _rev })
    ctx.status = 201
  } catch (err) {
    ctx.status = err.message === 'user not found' ? 404 : 500
    ctx.body = { error: err.message }
  }
})

/// GET HTTP REQUETS ///

/**
 * Get the currently logged in user's information
 *
 * @returns {string} name - Name of the user
 * @returns {string} email - Email address of the user
 * @returns {string} streetAddress - Street address number of the user
 * @returns {string} role - Role of the user
 */
router.get('/me', ethereumSignatureMiddleware, async (ctx) => {
  try {
    const { name, email, streetAddress, role } = await findUserByAddress(ctx.userAddress)
    faucet(ctx.userAddress)
    ctx.body = { name, email, streetAddress, role }
  } catch (err) {
    ctx.status = err.message === 'user not found' ? 404 : 500
    ctx.body = { error: err.message }
  }
})

/**
 * Get the Network of a user given their ethereum signature
 */
router.get('/network', ethereumSignatureMiddleware, async (ctx) => {
  try {
    let { role, inviter } = await findUserByAddress(ctx.userAddress)
    if (role == 'admin') {
      let { rows } = await db.view('doc', 'users', { include_docs: true })
      let docs = rows.map((row) => row.doc)
      ctx.body = await networkResponse(docs, role)
    } else {
      let inviterRow = await findUserByAddress(inviter)
      let { rows } = await db.view('doc', 'inviteBy', { key: ctx.userAddress, include_docs: true })
      let docs = rows.map((row) => row.doc)
      let concat = [].concat(docs, inviterRow)
      ctx.body = await networkResponse(concat, role)
    }
  } catch (err) {
    ctx.status = err.message === 'user not found' ? 404 : 500
  }
})

/**
 * Get a user's information
 *
 * @param {string} address - Ethereum address of the user
 *
 * @returns {string} name - Name of the user
 * @returns {string} email - Email address of the user
 * @returns {string} streetAddress - Street address number of the user
 * @returns {string} role - Role of the user
 */
router.get('/:address', ethereumSignatureMiddleware, async (ctx) => {
  try {
    const { name, email, streetAddress, role } = await findUserByAddress(ctx.params.address)
    ctx.body = { name, email, streetAddress, role }
  } catch (err) {
    ctx.status = err.message === 'user not found' ? 404 : 500
    ctx.body = { error: err.message }
  }
})

/**
 * Get a user's photo
 *
 * @param {string} address - Ethereum address of the user
 *
 * @returns {Buffer} photo - Photo of the user
 */
router.get('/:address/photo', ethereumSignatureMiddleware, async (ctx) => {
  try {
    let { _id } = await findUserByAddress(ctx.params.address)
    if (!(await db.attachment.get(_id, 'profile.jpg'))) throw new Error('photo not found')
    ctx.body = await db.attachment.get(_id, 'profile.jpg')
  } catch (err) {
    ctx.status = err.message === 'photo not found' ? 404 : 500
    ctx.body = { error: err.message }
  }
})

/// HELPERS ///

/**
 * Format a network request
 * @param {object} rows users returned from
 */
const networkResponse = async (docs, role) => {
  let resp = { admin: [], owner: [], gc: [], sc: [] }
  docs.forEach((doc) => delete doc['_attachments'])
  console.log('ROLE: ', role)
  resp.admin = docs.filter((doc) => doc.role == 'admin')
  resp.owner = docs.filter((doc) => doc.role == 'owner')
  resp.gc = docs.filter((doc) => doc.role == 'gc')
  resp.sc = docs.filter((doc) => doc.role == 'sc')
  if (role === 'admin') {
    for (let i = 0; i < resp.owner.length; i++) {
      let key = resp.owner[i].address
      let { rows } = await db.view('doc', 'owner-projects', { key, include_docs: true })
      resp.owner[i].sharedProjects = rows.map((response) => response.doc.deployed)
    }
    for (let i = 0; i < resp.gc.length; i++) {
      let key = resp.gc[i].address
      let { rows } = await db.view('doc', 'gc-projects', { key, include_docs: true })
      resp.gc[i].sharedProjects = rows.map((response) => response.doc.deployed)
    }
    for (let i = 0; i < resp.sc.length; i++) {
      let key = resp.sc[i].address
      let { rows } = await db.view('doc', 'sc-projects', { key, include_docs: true })
      resp.sc[i].sharedProjects = rows.map((response) => response.doc.project)
    }
  } else if (role === 'owner') {
    for (let i = 0; i < resp.gc.length; i++) {
      let key = resp.gc[i].address
      let { rows } = await db.view('doc', 'gc-projects', { key, include_docs: true })
      resp.gc[i].sharedProjects = rows.map((response) => response.doc.deployed)
    }
  } else if (role === 'gc') {
    console.log('GC!')
    for (let i = 0; i < resp.sc.length; i++) {
      let key = resp.sc[i].address
      let { rows } = await db.view('doc', 'sc-projects', { key, include_docs: true })
      resp.sc[i].sharedProjects = rows.map((response) => response.doc.project)
    }
  }
  return resp
}

/* const getSharedProjects = ()
 */
module.exports = router
