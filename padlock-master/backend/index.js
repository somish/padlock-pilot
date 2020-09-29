/// IMPORTS ///
require('dotenv').config()

const Koa = require('koa')
const cors = require('@koa/cors')
const bodyParser = require('koa-body')

const inviteRouter = require('./router/invite')
const userRouter = require('./router/user')
const projectRouter = require('./router/project')
const taskRouter = require('./router/task')
const documentRouter = require('./router/document')
const requestRouter = require('./router/request')

/**
 * Padlock v0.1.0 API
 * @date: 07.25.2020
 * @author Blox Consulting LLC
 *
 * Routes + logic, middleware, configuration of Padlock backend API
 */

/// CONFIG ///
const app = new Koa()
app.use(cors({ origin: '*', allowHeaders: ['X-Ethereum-Signature', 'Content-Type'], exposeHeaders: ['content-type'] }))
app.use(bodyParser({ multipart: true, includeUnparsed: true, jsonLimit: '12mb' }))
let port = process.env.REACT_APP_PORT || 8080
console.log(`Padlock API on port ${port}`)

/// ROUTES ///
app.use(inviteRouter.routes())
app.use(userRouter.routes())
app.use(projectRouter.routes())
app.use(requestRouter.routes())
app.use(taskRouter.routes())
app.use(documentRouter.routes())
module.exports = app.listen(port)
