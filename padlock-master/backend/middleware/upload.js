const getRawBody = require('raw-body')
const unparsed = require('koa-body/unparsed')

function makeFileUploadMiddleware(opts) {
  return async function fileUploadMiddleware(ctx, next) {
    ctx.request.body = ctx.request.body || {}
    ctx.request.body[unparsed] = await getRawBody(ctx.req, { ...opts, length: ctx.req.headers['content-length'] })
    await next()
  }
}

module.exports = makeFileUploadMiddleware
