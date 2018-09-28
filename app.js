const Koa = require('koa')

const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')

const index = require('./routes/index')
const users = require('./routes/users')
const book = require('./routes/book')
const chapter = require('./routes/chapter')
const bag = require('./routes/bag')
const comment = require('./routes/comment')
const reply = require('./routes/reply')
const recommend = require('./routes/recommend')
const suggest = require('./routes/suggest')

// error handler
onerror(app)

// middlewares
app.use(bodyparser({
  enableTypes: ['json', 'form', 'text']
}))

app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'pug'
}))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// routes
app.use(index.routes(), index.allowedMethods())
app.use(users.routes(), users.allowedMethods())
app.use(book.routes(), book.allowedMethods())
app.use(chapter.routes(), chapter.allowedMethods())
app.use(bag.routes(), bag.allowedMethods())
app.use(comment.routes(), comment.allowedMethods())
app.use(reply.routes(), reply.allowedMethods())
app.use(recommend.routes(), recommend.allowedMethods())
app.use(suggest.routes(), suggest.allowedMethods())


// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
