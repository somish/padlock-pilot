/* eslint-disable no-param-reassign */
const { ecsign, toRpcSig, hashPersonalMessage, privateToAddress } = require('ethereumjs-util')
const unparsed = require('koa-body/unparsed')
const { messageFromRequest } = require('esm')(module)('../../frontend/src/lib/auth')

const { CHAIN_ID, REACT_APP_API_BASE } = process.env

const addressFromPrivKey = (privKey) => {
  return `0x${privateToAddress(Buffer.from(privKey, 'hex')).toString('hex')}`
}

const signatureFromRequest = async (method, url, privKey, body) => {
  const data = body && body[unparsed] ? body[unparsed] : body
  const hash = hashPersonalMessage(await messageFromRequest({ method, url: REACT_APP_API_BASE + url, body: data }))
  const { v, r, s } = ecsign(hash, Buffer.from(privKey, 'hex'), CHAIN_ID)
  return toRpcSig(v, r, s, CHAIN_ID)
}

module.exports = { addressFromPrivKey, signatureFromRequest }
