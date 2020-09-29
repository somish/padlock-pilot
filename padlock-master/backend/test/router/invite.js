/* eslint-disable no-param-reassign */
/* eslint-disable import/no-extraneous-dependencies */
require('dotenv').config()
const test = require('ava')
const request = require('supertest')
const { addressFromPrivKey, signatureFromRequest } = require('../_util')
const app = require('../../index')
const db = require('../../lib/db')

const adminPrivKey = '6356c10bcf84f81910f7467ffa209890c4f35e87ecfcd4da702317e4cd6987d5'
const ownerPrivKey = 'bae6c56b9a4fefa3177c57000bf5409ad46172b677d57d6e6e2e1d036143681c'
const gcPrivKey = '7e41b09e5e938d7f0b52259dd1e012195741892be34dc3bf0966c9006e127186'
const scPrivKey = '8161cc9fdb955f4cd4aed67753a26f3b2e6c941b5202c0ddc5378cfad6fbeab7'

test.before(async (t) => {
  t.context.admin = await db.insert({ type: 'user', role: 'admin', address: addressFromPrivKey(adminPrivKey) })
  t.context.owner = await db.insert({ type: 'user', role: 'owner', address: addressFromPrivKey(ownerPrivKey) })
  t.context.gc = await db.insert({ type: 'user', role: 'gc', address: addressFromPrivKey(gcPrivKey) })
  t.context.sc = await db.insert({ type: 'user', role: 'sc', address: addressFromPrivKey(scPrivKey) })
})

test.after.always(async (t) => {
  await db.destroy(t.context.admin.id, t.context.admin.rev)
  await db.destroy(t.context.owner.id, t.context.owner.rev)
  await db.destroy(t.context.gc.id, t.context.gc.rev)
  await db.destroy(t.context.sc.id, t.context.sc.rev)
})

test('POST /api/invite rejects request without signature header', async (t) => {
  const res = await request(app).post('/api/invite')
  t.is(res.status, 401)
})

test('POST /api/invite rejects request with invalid signature header', async (t) => {
  const res = await request(app).post('/api/invite').set('X-Ethereum-Signature', 'foo')
  t.is(res.status, 401)
})

test('POST /api/invite rejects request missing invitee name', async (t) => {
  const body = { email: `${Math.random().toString()}@email.com` }
  const signature = await signatureFromRequest('POST', '/api/invite', adminPrivKey, body)
  const res = await request(app).post('/api/invite').set('X-Ethereum-Signature', signature).send(body)
  t.is(res.status, 400)
  t.deepEqual(res.body, { error: 'missing invitee name' })
})

test('POST /api/invite rejects request missing invitee email', async (t) => {
  const body = { name: Math.random().toString() }
  const signature = await signatureFromRequest('POST', '/api/invite', adminPrivKey, body)
  const res = await request(app).post('/api/invite').set('X-Ethereum-Signature', signature).send(body)
  t.is(res.status, 400)
  t.deepEqual(res.body, { error: 'missing invitee email' })
})

test('POST /api/invite rejects request from sc', async (t) => {
  const body = { name: Math.random().toString(), email: `${Math.random().toString()}@email.com` }
  const signature = await signatureFromRequest('POST', '/api/invite', scPrivKey, body)
  const res = await request(app).post('/api/invite').set('X-Ethereum-Signature', signature).send(body)
  t.is(res.status, 400)
  t.deepEqual(res.body, { error: 'action unauthorized' })
})

test('POST /api/invite accepts request from admin', async (t) => {
  const body = { name: Math.random().toString(), email: `${Math.random().toString()}@email.com` }
  const signature = await signatureFromRequest('POST', '/api/invite', adminPrivKey, body)
  let res = await request(app).post('/api/invite').set('X-Ethereum-Signature', signature).send(body)
  t.is(res.status, 201)

  const { invitationId } = res.body
  res = await request(app).get(`/api/invite/${invitationId}`)
  t.is(res.status, 200)
  t.deepEqual(res.body, { ...body, role: 'owner', inviter: addressFromPrivKey(adminPrivKey) })

  const { _rev } = await db.get(invitationId)
  await db.destroy(invitationId, _rev)
})

test('POST /api/invite accepts request from owner', async (t) => {
  const body = { name: Math.random().toString(), email: `${Math.random().toString()}@email.com` }
  const signature = await signatureFromRequest('POST', '/api/invite', ownerPrivKey, body)
  let res = await request(app).post('/api/invite').set('X-Ethereum-Signature', signature).send(body)
  t.is(res.status, 201)

  const { invitationId } = res.body
  res = await request(app).get(`/api/invite/${invitationId}`)
  t.is(res.status, 200)
  t.deepEqual(res.body, { ...body, role: 'gc', inviter: addressFromPrivKey(ownerPrivKey) })

  const { _rev } = await db.get(invitationId)
  await db.destroy(invitationId, _rev)
})

test('POST /api/invite accepts request from gc', async (t) => {
  const body = { name: Math.random().toString(), email: `${Math.random().toString()}@email.com` }
  const signature = await signatureFromRequest('POST', '/api/invite', gcPrivKey, body)
  let res = await request(app).post('/api/invite').set('X-Ethereum-Signature', signature).send(body)
  t.is(res.status, 201)

  const { invitationId } = res.body
  res = await request(app).get(`/api/invite/${invitationId}`)
  t.is(res.status, 200)
  t.deepEqual(res.body, { ...body, role: 'sc', inviter: addressFromPrivKey(gcPrivKey) })

  const { _rev } = await db.get(invitationId)
  await db.destroy(invitationId, _rev)
})

test('POST /api/invite/me returns invitations made by a user', async (t) => {
  const body = { name: Math.random().toString(), email: `${Math.random().toString()}@email.com` }
  let signature = await signatureFromRequest('POST', '/api/invite', gcPrivKey, body)
  let res = await request(app).post('/api/invite').set('X-Ethereum-Signature', signature).send(body)
  t.is(res.status, 201)

  const { invitationId } = res.body
  signature = await signatureFromRequest('GET', '/api/invite/me', gcPrivKey)
  res = await request(app).get(`/api/invite/me`).set('X-Ethereum-Signature', signature)
  t.is(res.status, 200)
  t.deepEqual(
    {
      ...res.body.invitations[0],
      _rev: null,
    },
    {
      _id: invitationId,
      type: 'invitation',
      role: 'sc',
      inviter: addressFromPrivKey(gcPrivKey),
      ...body,
      _rev: null,
    }
  )

  const { _rev } = await db.get(invitationId)
  await db.destroy(invitationId, _rev)
})
