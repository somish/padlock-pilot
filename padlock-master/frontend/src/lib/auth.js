export async function messageFromRequest(request) {
  if (!request.method) throw new Error('missing method on request')
  if (!request.url) throw new Error('missing url on request')
  let { body } = request

  if (typeof File !== 'undefined' && body instanceof File) {
    body = Buffer.from(await body.arrayBuffer())
  }

  if (body instanceof Buffer) {
    let header = Buffer.from(`${request.method.toUpperCase()}\n${request.url}\n`, 'utf8')
    return Buffer.concat([header, body])
  }

  if (typeof body === 'undefined') {
    body = ''
  }

  if (typeof body !== 'string') {
    body = JSON.stringify(body)
  }

  let message = `${request.method.toUpperCase()}\n${request.url}\n${body}`
  return Buffer.from(message, 'utf8')
}
