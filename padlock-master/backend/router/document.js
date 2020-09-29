/// IMPORTS ///
const { AssertionError, strict: assert } = require('assert')
const db = require('../lib/db')
const { make } = require('../lib/request')
const ethereumSignatureMiddleware = require('../middleware/auth')
const Router = require('koa-router')
const router = new Router({ prefix: '/api/document' })

/**
 * Project Routes for Padlock v0.1.0
 * @date: 07.25.2020
 * @author: Blox Consulting LLC
 *
 * Routes use to interact with documents
 */

/// POST HTTP REQUESTS ///

/**
 * Create a document
 *
 * @param {querystring} task - the couchdb id of the task containing the document
 * @param {string} title - Title of the document (should not be sha3 hash)
 * @param {string} author - internal id/ public key of original poster
 * @param {File} file - the file being uploaded, encoded in base64
 * @returns {string} id - Id of the created document
 */
router.post('/:taskid', ethereumSignatureMiddleware, async (ctx) => {
  try {
    const { title, file, type, extension, description } = ctx.request.body
    let desc = extension === 'txt' ? description : 'None'
    let decoded = extension === 'txt' ? '' : Buffer.from(file, 'base64')
    const { id, rev } = await db.insert({
      type: 'document',
      taskid: ctx.params.taskid,
      extension: extension,
      author: ctx.userAddress,
      fileName: title,
      description: desc,
    })
    extension === 'txt' ? null : await db.attachment.insert(id, title + '.' + extension, decoded, type, { rev })
    //request here
    ctx.status = 201
    ctx.body = { id }
  } catch (err) {
    ctx.status = 500
    ctx.body = { error: err.message }
  }
})

/// GET HTTP REQUESTS ///

/**
 * Get a document's metadata
 *
 * @param {string} documentId - Id of the document
 *
 * @returns {string} fileName - Title of the document
 * @returns {string} author - Id of the user who posted the document
 * @returns {string} hash - Hash of the document as stored on PadLock ledger
 * @returns {number} timestamp - Unix timestamp of document creation
 */
router.get('/:documentId', ethereumSignatureMiddleware, async (ctx) => {
  try {
    const { documentId } = ctx.params
    const { fileName, author } = await db.get(documentId)
    ctx.body = { fileName, author }
  } catch (err) {
    ctx.status = 500
    ctx.body = { error: err.message }
  }
})
/**
 * Get a document's attachment
 *
 * @param {string} documentid - couchdb uuid of the document
 *
 * @returns {Buffer} base64 encoded file
 */
router.get('/:documentid/file', ethereumSignatureMiddleware, async (ctx) => {
  try {
    const { fileName, extension } = await db.get(ctx.params.documentid)
    const res = await db.attachment.get(ctx.params.documentid, `${fileName}.${extension}`)
    ctx.body = res
  } catch (err) {
    ctx.status = 500
    ctx.body = { error: err.message }
  }
})

module.exports = router
