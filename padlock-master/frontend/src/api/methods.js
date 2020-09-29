import request from './request'

const API_BASE = process.env.REACT_APP_API_BASE

// api/user/*

export function me(sign) {
  return request(sign, { method: 'GET', url: API_BASE + '/api/user/me' })
}

export function getUser(sign, userID) {
  return request(sign, { method: 'GET', url: API_BASE + '/api/user/' + userID })
}

export async function getProfilePhoto(sign, userID) {
  let resp = await request(sign, { method: 'GET', url: API_BASE + '/api/user/' + userID + '/photo' })
  return URL.createObjectURL(await resp.blob())
}

export function uploadProfilePhoto(sign, file) {
  return request(sign, { method: 'POST', url: API_BASE + '/api/user/photo', body: file })
}

export function register(sign, payload) {
  return request(sign, { method: 'POST', url: API_BASE + '/api/user', body: payload })
}

// api/invite/*

export function invite(sign, payload) {
  return request(sign, { method: 'POST', url: API_BASE + '/api/invite', body: payload })
}

export function inviteAdmin(sign, payload) {
  return request(sign, { method: 'POST', url: API_BASE + '/api/invite/admin', body: payload })
}

//use to get all invites of a logged in user (requires eth middleware)
export function getInvitations(sign) {
  return request(sign, { method: 'GET', url: API_BASE + '/api/invite/me' })
}

//get a single invitation by its uuid (no middleware)
export function getInvite(inviteID) {
  return request(null, { method: 'GET', url: API_BASE + '/api/invite/' + inviteID })
}

// api/network
export function getNetwork(sign) {
  return request(sign, { method: 'GET', url: API_BASE + '/api/user/network' })
}

// api/project/*

export function getMyProjects(sign) {
  return request(sign, { method: 'GET', url: API_BASE + '/api/project/me' })
}

export function getProject(sign, address) {
  return request(sign, { method: 'GET', url: API_BASE + '/api/project/' + address })
}

export function getProjectTasks(sign, projectID) {
  return request(sign, { method: 'GET', url: `${API_BASE}/api/project/${projectID}/tasks` })
}

export async function getProjectPhoto(sign, project) {
  let resp = await request(sign, { method: 'GET', url: API_BASE + `/api/project/${project}/cover` })
  return URL.createObjectURL(await resp.blob())
}

export function postProject(sign, payload) {
  return request(sign, { method: 'POST', url: API_BASE + `/api/project`, body: payload })
}

/**
 * Make the requests associated with releasing a gc's fee escrow
 * @param {object} sign web3 middleware
 * @param {string} project address of the deployed project contract
 * @param {number} value address of the deployed project contract
 */
export function releaseFeeEscrow(sign, project, value) {
  return request(sign, { method: 'POST', url: `${API_BASE}/api/project/${project}/escrow`, body: { value } })
}

// api/task/*

export function postTask(sign, payload) {
  return request(sign, { method: 'POST', url: `${API_BASE}/api/task/`, body: payload })
}

export function inviteSubcontractor(sign, taskid, subcontractor) {
  return request(sign, { method: 'POST', url: `${API_BASE}/api/task/${taskid}/${subcontractor}` })
}

export function getTask(sign, task) {
  return request(sign, { method: 'GET', url: API_BASE + '/api/task/' + task })
}

export function getLienRelease(sign, taskid, signature) {
  return request(sign, { method: 'POST', url: `${API_BASE}/api/task/${taskid}/lien`, body: { signature } })
}

//document apis

// get a document
export function getDocumentMetadata(sign, id) {
  return request(sign, { method: 'GET', url: API_BASE + `/api/document/${id}` })
}

export async function getDocumentFile(sign, id) {
  let resp = await request(sign, { method: 'GET', url: API_BASE + `/api/document/${id}/file` })
  return URL.createObjectURL(await resp.blob())
}

export function taskDocuments(sign, id) {
  return request(sign, { method: 'GET', url: API_BASE + `/api/task/${id}/documents` })
}

/**
 * Put a new document into a task
 * @param {*} sign eth signature
 * @param {string} taskid the couchdb uuid of the task
 * @param {*} payload requires title, author, task id, file binary
 * @todo fix route to choose task to place into
 */
export function postDocument(sign, taskid, payload) {
  return request(sign, { method: 'POST', url: `${API_BASE}/api/document/${taskid}`, body: payload })
}

/**
 * Query a specific request by its couchdb id
 * @param {string} requestId the couchdb uuid of a request document being queried
 */
export function getRequestById(sign, requestId) {
  return request(sign, { method: 'GET', url: `${API_BASE}/api/request/by/${requestId}` })
}

/**
 * Get requests according to the logged in recipient
 * @param address user uuid/magic ethereum pubkey
 */
export function myRequests(sign) {
  return request(sign, { method: 'GET', url: API_BASE + '/api/request/me' })
}

/**
 * Get requests according to the project they were fired from
 * @param address project uuid/deployed contract instance
 */
export let getRequestByProject = async (sign, address) => {
  return request(sign, { method: 'GET', url: `${API_BASE}/api/request/project/${address}` })
}

/**
 * Get requests according to the project they were fired from, only including transactions including exchange of funds
 * @param address project uuid/deployed contract instance
 */
export let getMoneyRequestByProject = async (sign, address) => {
  let req = await request(sign, { method: 'GET', url: `${API_BASE}/api/request/project/${address}` })
  let res = []
  res = res.concat(req.filter((request) => request.reqType === 'project_funded'))
  res = res.concat(req.filter((request) => request.reqType === 'task_funded'))
  res = res.concat(req.filter((request) => request.reqType === 'escrow_released'))
  res = res.concat(req.filter((request) => request.reqType === 'task_pending'))
  return res
}

/**
 * Resolve a request with a given uuid
 * @param requestId request couchdb uuid
 * @param value
 */
export async function resolve(sign, requestId, value) {
  return request(sign, { method: 'PUT', url: `${API_BASE}/api/request/resolve/${requestId}`, body: { value } })
}
