/// IMPORTS ///
const { AssertionError, strict: assert } = require('assert')
const db = require('../lib/db')
const SendInvitation = require('../lib/email')
const { findUserByAddress } = require('../lib/utils')
const ethereumSignatureMiddleware = require('../middleware/auth')
const Router = require('koa-router')
const router = new Router({ prefix: '/api/invite' })

/**
 * Project Routes for Padlock v0.1.0
 * @date: 07.25.2020
 * @author: Blox Consulting LLC
 *
 * Routes use to interact with invitations
 */

/// POST HTTP REQUESTS ///

/**
 * Create a new invitation, specifically for an administrator
 *
 * @param { string } name - the name of the account
 * @param { string } email - the email address to send the invitation to
 */
router.post('/admin', ethereumSignatureMiddleware, async (ctx) => {
  try {
    let { name, email } = ctx.request.body
    assert.ok(name, 'missing invitee name')
    assert.ok(email, 'missing invitee email')
    const { id: invitationId } = await db.insert({
      type: 'invitation',
      role: 'admin',
      name,
      email,
      inviter: 'admin',
    })
    SendInvitation(email, 'admin', name, 'admin', invitationId)
    ctx.status = 201
  } catch (err) {
    ctx.status = 500
    ctx.body = err.message
  }
})

/**
 * Create a new invitation, dynamically choosing role according to inviter role
 *
 * @param {string} name - Name of the invitee
 * @param {string} email - Email address to send invitation to
 *
 * @returns {string} invitationId - Id of the created invitation
 */
router.post('/', ethereumSignatureMiddleware, async (ctx) => {
  try {
    const { name, email } = ctx.request.body
    assert.ok(name, 'missing invitee name')
    assert.ok(email, 'missing invitee email')
    const { role, name: inviterName } = await findUserByAddress(ctx.userAddress)
    let invitationRole
    switch (role) {
      case 'admin':
        invitationRole = 'owner'
        break
      case 'owner':
        invitationRole = 'gc'
        break
      case 'gc':
        invitationRole = 'sc'
        break
      default:
        throw new AssertionError({ message: 'action unauthorized' })
    }
    const { id: invitationId } = await db.insert({
      type: 'invitation',
      role: invitationRole,
      name,
      email,
      inviter: ctx.userAddress,
    })
    SendInvitation(email, inviterName, name, invitationRole, invitationId)
    ctx.status = 201
    ctx.body = { invitationId }
  } catch (err) {
    ctx.status = err instanceof AssertionError || err.message === 'user not found' ? 400 : 500
    ctx.body = { error: err.message }
  }
})

/// GET HTTP REQUESTS ///

/**
 * Get invitations made by a user
 *
 * @returns {Array} invitations - Ids of invitations
 */
router.get('/me', ethereumSignatureMiddleware, async (ctx) => {
  try {
    const res = await db.view('doc', 'invitations', { key: ctx.userAddress, include_docs: true })
    ctx.body = { invitations: res.rows.map((row) => row.doc) }
  } catch (err) {
    ctx.status = 404
    ctx.body = { error: err.message }
  }
})

/**
 * Get an invitation
 *
 * @param {string} invitationId - couchdb uuid of the invitation
 *
 * @returns {string} name - Name of the invitee
 * @returns {string} email - Email address of the invitee
 * @returns {string} role - Role of the invitee
 * @returns {string} inviter - Id of the inviter
 */
router.get('/:invitationId', async (ctx) => {
  try {
    const { invitationId } = ctx.params
    const { name, email, role, inviter } = await db.get(invitationId)
    ctx.body = { name, email, role, inviter }
  } catch (err) {
    ctx.status = 404
    ctx.body = { error: err.message }
  }
})

module.exports = router
