/// IMPORTS ///
const { AssertionError, strict: assert } = require('assert')
const db = require('../lib/db')
const { make } = require('../lib/request')
const { generateLienPdf } = require('./lien')
const { findProjectByAddress, findUserByAddress } = require('../lib/utils')
const ethereumSignatureMiddleware = require('../middleware/auth')
const Router = require('koa-router')
const router = new Router({ prefix: '/api/task' })

/**
 * Project Routes for Padlock v0.1.0
 * @date: 07.25.2020
 * @author: Blox Consulting LLC
 *
 * Routes use to interact with tasks
 */

/// POST HTTP REQUESTS ///

/**
 * Create a new task
 * @param {string} project the address of the deployed project contract
 * @param {string} title the title of the task
 * @param {number} cost the number of PUSD tokens to be paid out for completion of project
 * @param {number} phase the phase number of the task
 * @param {string} sc the address of the sc (null if none)
 * @param {number} index the index of the task within the smart contract
 * @return {string} the uuid of the newly created task document within CouchDB
 */
router.post('/', ethereumSignatureMiddleware, async (ctx) => {
  try {
    let { project, title, cost, phase, index, sc } = ctx.request.body
    assert.ok(project, 'Project address not included!')
    assert.ok(title, 'Task title not included!')
    assert.ok(cost, 'Task cost not included!')
    assert.ok(phase, 'Task phase not included!')
    assert.ok(index, 'Index not included!')
    let { owner } = await findProjectByAddress(project)
    let { id } = await db.insert({
      type: 'task',
      project,
      title,
      cost,
      phase,
      index,
    })
    make('task_created', owner, ctx.userAddress, project, id)
    make('task_funding_needed', 'admin', ctx.userAddress, project, id)
    if (sc) make('sc_invited', sc, ctx.userAddress, project, id)
    ctx.status = 201
    ctx.body = id
  } catch (e) {
    ctx.status = 500
    ctx.body = { error: e.message }
  }
})

/**
 * Create and return a lien release according to the task
 * @param {string} taskid the couchdb uuid of the task generating a lien release
 * @param {string} signature the signed statement 'Padlock Task Lien Release' + taskid by the user's pkey
 */
router.post('/:taskid/lien', ethereumSignatureMiddleware, async (ctx) => {
  try {
    console.log('Starting')
    let { taskid } = ctx.params
    let { signature } = ctx.request.body
    let { title: taskTitle, cost, project } = await db.get(taskid)
    let { gc, address, title: projectTitle } = await findProjectByAddress(project)
    let { name: gcName, address: gcAddress } = await findUserByAddress(gc)
    let { name: scName, address: scAddress } = await findUserByAddress(ctx.userAddress)
    let now = new Date()
    let day = now.getDate()
    let year = now.getFullYear()
    let month = now.getMonth() + 1
    let payload = {
      signature,
      taskTitle,
      projectTitle,
      address,
      cost,
      gcName,
      gcAddress,
      scName,
      scAddress,
      day,
      month,
      year,
    }
    let buffer = await generateLienPdf(payload)
    make('lien_release_submitted', gc, ctx.userAddress, project, taskid, cost)
    ctx.body = buffer.toString('base64')
  } catch (err) {
    console.log('failed')
    ctx.status = err.message === 'no subcontractor' ? 400 : 500
    ctx.body = { error: err.message }
  }
})

/**
 * Make a subcontractor invited to task request
 * @param {string} taskid the couchdb uuid of the task the sc is invited to
 * @param {string} subcontractor the address of the user being invited as a subcontractor on the task
 */
router.post('/:taskid/:subcontractor', ethereumSignatureMiddleware, async (ctx) => {
  try {
    let { taskid, subcontractor } = ctx.params
    let { project } = await db.get(taskid)
    make('sc_invited', subcontractor, ctx.userAddress, project, taskid)
    ctx.body = 'sc invitation sent'
  } catch (err) {
    ctx.status = 500
    ctx.body = { error: err.message }
  }
})

/**
 * Make a subcontractor invited to task request
 * @param {string} taskid the couchdb uuid of the task the sc is invited to
 * @param {string} subcontractor the address of the user being invited as a subcontractor on the task
 */
router.post('/:taskid/:subcontractor', ethereumSignatureMiddleware, async (ctx) => {
  try {
    let { taskid, subcontractor } = ctx.params
    let { project } = await db.get(taskid)
    make('sc_invited', subcontractor, ctx.userAddress, project, taskid)
    ctx.body = 'sc invitation sent'
  } catch (err) {
    ctx.status = 500
    ctx.body = { error: err.message }
  }
})

//from project: gc.name, address, title
//from task: sc.name, sc.address, title, cost

/// GET HTTP REQUESTS ///

/**
 * Get a task's metadata
 *
 * @param {string} taskid - couchdb uuid of the task
 *
 * @returns {object}  - the task entry within couchdb
 */
router.get('/:taskid', ethereumSignatureMiddleware, async (ctx) => {
  try {
    ctx.body = await db.get(ctx.params.taskid)
  } catch (err) {
    ctx.status = 500
    ctx.body = { error: err.message }
  }
})

/**
 * Get all the documents associated with a given task
 *
 * @param {string} taskid - couchdb uuid of the task being queried for documents
 * @returns comments: array of document objects that are plaintext
 * @returns images: array of document objects that are b64 encoded jpeg or png
 * @returns documents: array of document objects that are b64 encoded pdf
 */
router.get('/:taskid/documents', async (ctx) => {
  try {
    let ret = { comments: [], images: [], documents: [] }
    let { rows } = await db.view('doc', 'documents', { key: ctx.params.taskid, include_docs: true })
    let docs = rows.map((row) => row.doc)
    docs.forEach((doc) => delete doc['_attachments'])
    ret.comments = docs.filter((doc) => doc.extension == 'txt')
    ret.images = docs.filter((doc) => doc.extension == 'jpg')
    ret.documents = docs.filter((doc) => doc.extension == 'pdf')
    ctx.body = ret
  } catch (err) {
    ctx.status = 500
    ctx.body = { error: err.message }
  }
})

module.exports = router
