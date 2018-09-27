const router = require('koa-router')()
const service = require('../service.js')

router.prefix('/api/bag')

router.get('/list', async function (ctx, next) {

  var result = await service.raw("select book.* from bag inner join book on bag.bookId = book.id  where bag.userId = " + ctx.request.header["user-id"]);

  ctx.body = result[0];
})

router.get('/alike', async function (ctx, next) {
  var result = await service.column("*").select().from('book').limit(8)
  ctx.body = result;
})

router.post('/add', async function (ctx, next) {
  var record = ctx.request.body;
  await service("bag").insert({ bookId: record.bookId, userId: ctx.request.header["user-id"] });

  await service.raw("update book set collectCount = collectCount + 1 where id = " + record.bookId);

  ctx.body = "ok";
})

router.post('/cancel', async function (ctx, next) {
  var record = ctx.request.body;
  await service("bag").where({ bookId: record.bookId, userId: ctx.request.header["user-id"] }).del();

  await service.raw("update book set collectCount = collectCount - 1 where id = " + record.bookId);

  ctx.body = "ok";
})


module.exports = router
