const fs = require('fs')
const assert = require('assert').strict
const { ecrecover, fromRpcSig, hashPersonalMessage, isValidSignature, publicToAddress } = require('ethereumjs-util')
const unparsed = require('koa-body/unparsed')
const { messageFromRequest } = require('esm')(module)('../../frontend/src/lib/auth')

const { CHAIN_ID, REACT_APP_API_BASE } = process.env

const ethereumSignatureMiddleware = async (ctx, next) => {
  try {
    const { headers, method, url, body, files } = ctx.request

    const contentType = headers['Content-Type'] || headers['content-type']
    const signature = headers['X-Ethereum-Signature'] || headers['x-ethereum-signature']
    assert.ok(signature, 'missing X-Ethereum-Signature header')

    const { v, r, s } = fromRpcSig(signature)
    assert.ok(isValidSignature(v, r, s, false, CHAIN_ID), 'invalid signature')

    let tmp = await messageFromRequest({ method, url: REACT_APP_API_BASE + url, body: ctx.request.body[unparsed] })
    const hash = hashPersonalMessage(tmp)
    const pubkey = ecrecover(hash, v, r, s, CHAIN_ID)
    const address = `0x${publicToAddress(pubkey, true).toString('hex')}`

    ctx.userAddress = address
    // this will be falsy in the test environment
    if (ctx.set) {
      ctx.set('X-Ethereum-Address', address)
    }

    await next()
  } catch (err) {
    ctx.status = 401
    ctx.body = { error: err.message }
  }
}

module.exports = ethereumSignatureMiddleware
