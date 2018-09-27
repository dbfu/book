
const router = require('koa-router')()
const service = require('../service.js')
const moment = require('moment')

router.prefix('/api/recommend')


router.post('/add', async function (ctx, next) {
  var record = ctx.request.body;

  var time = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

  var result = await service("recommend").count("* as count").where({ userId: ctx.request.header["user-id"], bookId: record.bookId });

  if (result[0].count) {
    await service("recommend").update({ date: time }).where({ userId: ctx.request.header["user-id"], bookId: record.bookId });
  } else {
    await service("recommend").insert({ userId: ctx.request.header["user-id"], date: time, bookId: record.bookId });
  }

  // await service("recommend").insert({ userId: ctx.request.header["user-id"], date: time, bookId: record.bookId });

  await service.raw(`update book set recommendCount=recommendCount+1 where id = ${record.bookId}`);

  ctx.body = "ok";
})


router.post('/cancel', async function (ctx, next) {
  var record = ctx.request.body;
  await service("bag").where({ bookId: record.bookId, userId: ctx.request.header["user-id"] }).del();
  ctx.body = "ok";
})


module.exports = router
