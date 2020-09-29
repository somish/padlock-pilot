/* eslint-disable import/no-extraneous-dependencies */
require('dotenv').config()
const test = require('ava')
const unparsed = require('koa-body/unparsed')
const ethereumSignatureMiddleware = require('../../middleware/auth')
const { addressFromPrivKey, signatureFromRequest } = require('../_util')

const privKey = 'a1576adff0b62907352e698c3272df5ad38f6c7710fdbcbfdac73bf0836a229c'
const ethAddress = addressFromPrivKey(privKey)

test('ethereum signature middleware rejects request without signature', async (t) => {
  let nextCalled = false
  const next = async () => {
    nextCalled = true
  }
  const ctx = { request: { method: 'GET', url: '/test', headers: { 'Content-Type': 'application/json' } } }
  await ethereumSignatureMiddleware(ctx, next)
  t.is(ctx.status, 401)
  t.false(nextCalled)
})

test('ethereum signature middleware rejects request with invalid signature', async (t) => {
  let nextCalled = false
  const next = async () => {
    nextCalled = true
  }
  const ctx = {
    request: {
      method: 'GET',
      url: '/test',
      headers: { 'Content-Type': 'application/json', 'X-Ethereum-Signature': 'foo' },
    },
  }
  await ethereumSignatureMiddleware(ctx, next)
  t.is(ctx.status, 401)
  t.false(nextCalled)
})

test('ethereum signature middleware produces bad address for request with method/signature mismatch', async (t) => {
  let nextCalled = false
  const next = async () => {
    nextCalled = true
  }
  const request = { method: 'GET', url: '/test', body: { [unparsed]: '{"test":"test"}' } }
  request.headers = {
    'Content-Type': 'application/json',
    'X-Ethereum-Signature': await signatureFromRequest(request.method, request.url, privKey, request.body),
  }
  request.method = 'POST'
  const ctx = { request }
  await ethereumSignatureMiddleware(ctx, next)
  t.not(ctx.userAddress, ethAddress)
  t.true(nextCalled)
})

test('ethereum signature middleware produces bad address for request with url/signature mismatch', async (t) => {
  let nextCalled = false
  const next = () => {
    nextCalled = true
  }
  const request = { method: 'POST', url: '/test', body: { [unparsed]: '{"test":"test"}' } }
  request.headers = {
    'Content-Type': 'application/json',
    'X-Ethereum-Signature': await signatureFromRequest(request.method, request.url, privKey, request.body),
  }
  request.url = '/not/test'
  const ctx = { request }
  await ethereumSignatureMiddleware(ctx, next)
  t.not(ctx.userAddress, ethAddress)
  t.true(nextCalled)
})

test('ethereum signature middleware produces bad address for request with body/signature mismatch', async (t) => {
  let nextCalled = false
  const next = () => {
    nextCalled = true
  }
  const request = { method: 'POST', url: '/test', body: { [unparsed]: '{"test":"test"}' } }
  request.headers = {
    'Content-Type': 'application/json',
    'X-Ethereum-Signature': await signatureFromRequest(request.method, request.url, privKey, request.body),
  }
  request.body[unparsed] = 'bar'
  const ctx = { request }
  await ethereumSignatureMiddleware(ctx, next)
  t.not(ctx.userAddress, ethAddress)
  t.true(nextCalled)
})

test('ethereum signature middleware accepts request with correct signature', async (t) => {
  let nextCalled = false
  const next = () => {
    nextCalled = true
  }
  const request = { method: 'POST', url: '/test', body: { [unparsed]: '{"test":"test"}' } }
  request.headers = {
    'Content-Type': 'application/json',
    'X-Ethereum-Signature': await signatureFromRequest(request.method, request.url, privKey, request.body),
  }
  const ctx = { request }
  await ethereumSignatureMiddleware(ctx, next)
  t.is(ctx.userAddress, ethAddress)
  t.true(nextCalled)
})
