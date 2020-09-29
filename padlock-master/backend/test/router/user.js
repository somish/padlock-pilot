/* eslint-disable no-param-reassign */
/* eslint-disable import/no-extraneous-dependencies */
require('dotenv').config()
const test = require('ava')
const request = require('supertest')
const { addressFromPrivKey, signatureFromRequest } = require('../_util')
const app = require('../../index')
const db = require('../../lib/db')

const adminPrivKey = 'a9429df2edd603f21f7b0a3304f827b026e343dde31e5fed63d52a5fe8cca568'
const userPrivKey = '7659a519ee6e1a8bbce250416933369c8d3c56189a906d7766bae82f7edf4629'
const someonePrivKey = '67d5849164da4cedf968fb7ace597f1f501e89e56e763ea9ebfbb892dcdf26e8'
const adminAddress = addressFromPrivKey(adminPrivKey)
const userAddress = addressFromPrivKey(userPrivKey)
const someoneAddress = addressFromPrivKey(someonePrivKey)

test.before(async (t) => {
  t.context.admin = await db.insert({
    type: 'user',
    role: 'admin',
    address: adminAddress,
  })
  t.context.user = await db.insert({
    type: 'user',
    name: 'me',
    email: 'me@email.com',
    streetAddress: '1234 Fakestreet',
    role: 'user',
    address: userAddress,
  })
  t.context.someone = await db.insert({
    type: 'user',
    name: 'someone',
    email: 'someone@email.com',
    streetAddress: '1234 Fakestreet',
    role: 'user',
    address: someoneAddress,
  })
})

test.after.always(async (t) => {
  await db.destroy(t.context.admin.id, t.context.admin.rev)
  await db.destroy(t.context.user.id, t.context.user.rev)
  await db.destroy(t.context.someone.id, t.context.someone.rev)
})

test('GET /api/user/me rejects request without signature header', async (t) => {
  const res = await request(app).get('/api/user/me')
  t.is(res.status, 401)
})

test('GET /api/user/me rejects request with invalid signature header', async (t) => {
  const res = await request(app).get('/api/user/me').set('X-Ethereum-Signature', 'foo')
  t.is(res.status, 401)
})

test('GET /api/user/me accepts request', async (t) => {
  const signature = await signatureFromRequest('GET', '/api/user/me', userPrivKey)
  const res = await request(app).get('/api/user/me').set('X-Ethereum-Signature', signature)
  t.is(res.status, 200)
  t.deepEqual(res.body, { name: 'me', email: 'me@email.com', role: 'user', streetAddress: '1234 Fakestreet' })
})

test('GET /api/user/:address rejects request not found', async (t) => {
  const sig = await signatureFromRequest('GET', `/api/user/1234`, adminPrivKey, null)
  const res = await request(app).get(`/api/user/1234`).set('X-Ethereum-Signature', sig)
  t.is(res.status, 404)
})

test('GET /api/user/:address accepts request', async (t) => {
  const sig = await signatureFromRequest('GET', `/api/user/${userAddress}`, adminPrivKey, null)
  const res = await request(app).get(`/api/user/${userAddress}`).set('X-Ethereum-Signature', sig)
  t.is(res.status, 200)
  t.deepEqual(res.body, { name: 'me', email: 'me@email.com', role: 'user', streetAddress: '1234 Fakestreet' })
})

test('GET /api/user/:address accepts request 2', async (t) => {
  const sig = await signatureFromRequest('GET', `/api/user/${someoneAddress}`, adminPrivKey, null)
  const res = await request(app).get(`/api/user/${someoneAddress}`).set('X-Ethereum-Signature', sig)
  t.is(res.status, 200)
  t.deepEqual(res.body, { name: 'someone', email: 'someone@email.com', role: 'user', streetAddress: '1234 Fakestreet' })
})

test('POST /api/user rejects request without signature header', async (t) => {
  const res = await request(app).post('/api/user')
  t.is(res.status, 401)
})

test('POST /api/user rejects request with invalid signature header', async (t) => {
  const res = await request(app).post('/api/user').set('X-Ethereum-Signature', 'foo')
  t.is(res.status, 401)
})

test('POST /api/user accepts request', async (t) => {
  let body = { name: Math.random().toString(), email: `${Math.random().toString()}@email.com` }
  const invitationSig = await signatureFromRequest('POST', '/api/invite', adminPrivKey, body)
  let res = await request(app).post('/api/invite').set('X-Ethereum-Signature', invitationSig).send(body)
  t.is(res.status, 201)
  const { invitationId } = res.body
  body = { ...body, streetAddress: '1234 Fakestreet', invitationId }
  res = await request(app)
    .post('/api/user')
    .set('X-Ethereum-Signature', await signatureFromRequest('POST', '/api/user', userPrivKey, body))
    .send(body)
  t.is(res.status, 201)
  const { userId } = res.body
  {
    const { _rev } = await db.get(userId)
    await db.destroy(userId, _rev)
  }
  {
    const { _rev } = await db.get(invitationId)
    await db.destroy(invitationId, _rev)
  }
})
