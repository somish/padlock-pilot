/// IMPORTS ///
const { AssertionError, strict: assert } = require('assert')
const db = require('../lib/db')
const { make } = require('../lib/request')
const { findUserByAddress, findProjectByAddress } = require('../lib/utils')
const ethereumSignatureMiddleware = require('../middleware/auth')
const Router = require('koa-router')
const router = new Router({ prefix: '/api/project' })

/**
 * Project Routes for Padlock v0.1.0
 * @date: 07.25.2020
 * @author: Blox Consulting LLC
 *
 * Routes use to interact with projects
 */

/// POST HTTP REQUESTS ///

/**
 * Create a project
 *
 * @return {string} projectId - Id of the created project
 */
router.post('/', ethereumSignatureMiddleware, async (ctx) => {
  try {
    //initialize data from request
    let { deployed, title, owner, address, imagePayload } = ctx.request.body
    //insert new entry into couchdb
    let { rev, id } = await db.insert({
      type: 'project',
      title,
      deployed,
      gc: ctx.userAddress,
      owner,
      address,
    })
    //if image, attach to newly created couchdb document
    if (imagePayload) {
      let decoded = Buffer.from(imagePayload.file, 'base64')
      await db.attachment.insert(id, 'cover', decoded, imagePayload.type, { rev })
    }
    //make requests associated with project creation
    make('new_project', owner, ctx.userAddress, deployed)
    make('project_funding_needed', 'admin', ctx.userAddress, deployed)
    ctx.status = 201
    ctx.body = id
  } catch (err) {
    ctx.status = err instanceof AssertionError ? 400 : 500
    ctx.body = { error: err.message }
  }
})

/**
 * Make a request to denote that a phase's escrow was released
 * @dev incapable of explaining phase in request
 *      largely placeholder until more complex backend logic is included (only make escrow request)
 * @param {string} address the address of the deployed project contract
 * @param {number} value the number of PUSD tokens transferred
 */
router.post('/:address/escrow', ethereumSignatureMiddleware, async (ctx) => {
  try {
    let { value } = ctx.request.body
    console.log('VALUE: ', value)
    let project = await findProjectByAddress(ctx.params.address)
    make('escrow_released', project.gc, ctx.userAddress, project.deployed, null, value)
    ctx.body = { value }
  } catch (err) {
    ctx.status = 500
    ctx.body = { error: err.message }
  }
})

/// GET HTTP REQUESTS ///

/**
 * Get an array of project ids that are linked to a user
 *
 * @return an array of project ids to be queried
 */
router.get('/me', ethereumSignatureMiddleware, async (ctx) => {
  try {
    let { role } = await findUserByAddress(ctx.userAddress)
    let response = []
    if (role === 'admin') {
      let { rows } = await db.view('doc', 'projects', { include_docs: true })
      response = rows.map((response) => response.doc)
    } else if (role === 'owner') {
      let { rows } = await db.view('doc', 'owner-projects', { key: ctx.userAddress, include_docs: true })
      response = rows.map((response) => response.doc)
    } else if (role === 'gc') {
      let { rows } = await db.view('doc', 'gc-projects', { key: ctx.userAddress, include_docs: true })
      response = rows.map((response) => response.doc)
    } else if (role === 'sc') {
      let { rows } = await db.view('doc', 'sc-projects', { key: ctx.userAddress, include_docs: true })
      let keys = rows.map((response) => response.doc.project)
      let uniqueKeys = Array.from(new Set(keys))
      for (let i = 0; i < uniqueKeys.length; i++) response[i] = await findProjectByAddress(uniqueKeys[i])
    } else {
      throw new Error('Role not recognized')
    }
    ctx.body = response
  } catch (err) {
    if (err === 'user has no projects') ctx.status = 404
    else ctx.status = 500
    ctx.body = { error: err.message }
  }
})

router.get('/:projectid/tasks', ethereumSignatureMiddleware, async (ctx) => {
  try {
    let { projectid } = ctx.params
    let { role } = await findUserByAddress(ctx.userAddress)
    let response = []
    if (role === 'sc') {
      let { rows } = await db.view('doc', 'sc-tasks', { key: [ctx.userAddress, projectid], include_docs: true })
      let keys = rows.map((response) => response.doc.task)
      for (let i = 0; i < keys.length; i++) response[i] = await db.get(keys[i])
    } else {
      let { rows } = await db.view('doc', 'tasks', { key: ctx.params.projectid, include_docs: true })
      if (rows.length === 0) response = null
      else response = rows.map((res) => res.doc)
    }
    ctx.body = response
  } catch (err) {
    ctx.status = 500
    ctx.body = { error: err.message }
  }
})

/**
 * Get a project's metadata
 *
 * @param {string} address - deployed address of the project
 *
 * @returns {string} title - Title of the project
 * @returns {string} owner - Id of the owner managing the project
 * @returns {string} gc - Id of the general contractor managing the project
 * @returns {string} address - Postal address of the project
 * @returns {string} deployed - Ethereum address of the deployed project contract
 * @returns {Array} tasks - Array of ids of tasks linked to the project
 */
router.get('/:address', async (ctx) => {
  try {
    const { title, owner, gc, address, deployed, tasks } = await findProjectByAddress(ctx.params.address)
    ctx.body = { title, owner, gc, address, deployed, tasks }
  } catch (err) {
    ctx.status = 500
    ctx.body = { error: err.message }
  }
})

/**
 * Get a project's cover photo
 *
 * @param {string} addresss - the id of the project
 *
 * @return {Buffer} uploaded project cover photo
 */
router.get('/:address/cover', async (ctx) => {
  try {
    const { address } = ctx.params
    let { _id } = await findProjectByAddress(address)
    const res = await db.attachment.get(_id, 'cover')
    ctx.body = res
  } catch (err) {
    ctx.status = 500
    ctx.body = { error: err.message }
  }
})

module.exports = router
