import { messageFromRequest } from '../lib/auth'

async function generateSignature(sign, request) {
  return await sign(await messageFromRequest(request))
}

/**
 * Make a signed HTTP request
 *
 * @param method (required) http method (GET, POST, PUT, DELETE, etc)
 * @param url    (required) url or path of the resource
 * @param body   (optional) body of the request
 * @param sign   (required) the web3.eth.personal.sign function with it's fromAddress param pre-bound
 */
export default async function request(sign, { method, url, body }) {
  let headers = {}

  // if body is an object, turn it into json
  if (typeof body === 'object' && !(body instanceof File)) {
    headers['Content-Type'] = 'application/json'
    body = JSON.stringify(body)
  }

  // sign the request
  if (sign) headers['X-Ethereum-Signature'] = await generateSignature(sign, { method, url, body })

  let resp = await fetch(url, {
    method,
    headers,
    body,
  })

  if (!resp.ok) {
    let error = new Error('server responded with an http error')
    error.code = resp.status
    error.original = resp
    throw error
  }

  const respContentType = [...resp.headers.entries()].find(([k, v]) => k === 'content-type')

  if (/json/.test(respContentType)) {
    return await resp.json()
  }

  if (/text/.test(respContentType)) {
    return await resp.text()
  }

  return resp
}
