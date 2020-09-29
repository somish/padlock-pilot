const { AssertionError, strict: assert } = require('assert')
const db = require('./db')

/**
 * Make a new request in the database
 * @param reqType the type of request as enumerated internally (REQUIRED)
 * @param to the user sending the request (REQUIRED)
 * @param from the user recieving the request (REQUIRED)
 * @param project the project that the request occurred in (OPTIONAL)
 * @param task the task that the request occurred in (OPTIONAL)
 * @param task the value that transferred while making the request
 */
let make = async (reqType, to, from, project, task, value) => {
  console.log(`Making ${reqType} to ${to} with value ${value}`)
  await db.insert({ type: 'request', reqType, to, from, project, task, value, active: true })
  return
}

/**
 * Resolve an existing request in the database
 * @param requestid the CouchDB uuid of the request being resolved
 * @param value (OPTIONAL) the value transferred in the request
 */
let resolve = async (requestid, value) => {
  let request = await db.get(requestid)
  assert.ok(request.active, 'Cannot resolve a request that has already been resolved!')
  let makeFunction = {
    admin_joined: () => make('admin_approved', 'admin', 'admin'),
    owner_joined: () => make('owner_approved', request.from, 'admin'),
    gc_joined: () => make('gc_approved', request.from, request.to),
    project_funding_needed: () => make('project_funded', request.from, 'admin', request.project, null, value),
    task_funding_needed: () => make('project_funded', request.from, 'admin', request.project, request.task, value),
    sc_invited: () => make('sc_approved', request.from, request.to, request.project, request.task),
    lien_release_submitted: () => make('task_pending', request.from, request.to, request.project, request.task, value),
  }[request.reqType]
  if (makeFunction) await makeFunction()
  await dismissed(request)
}

/**
 * Update a request object as resolved (active: false) to dismiss
 * @param {object} request the couchdb request document being updated
 */
let dismissed = async (request) => {
  return await db.insert({
    _id: request._id,
    _rev: request._rev,
    type: request.type,
    reqType: request.reqType,
    to: request.to,
    from: request.from,
    active: false,
  })
}

module.exports = { make, resolve }
