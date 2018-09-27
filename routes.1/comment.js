const router = require('koa-router')()
const service = require('../service.js')
const moment = require('moment')

router.prefix('/api/comment')

router.get('/list', async function (ctx, next) {

  let page = ctx.query.page || 0;
  let size = ctx.query.size || 20;
  let type = ctx.query.type || "time";

  let sort = "c.createTime desc";
  if (type == "hot") {
    sort = "c.replyCount desc";
  }

  let sql = `SELECT c.id, u.avatarUrl,u.nickName,c.content, c.replyCount,c.createTime from comment as c INNER join users as u on c.userId = u.id where bookId = ${ctx.query.bookId} and c.type = 2 order by ${sort} limit ${page * size},${size}`;

  var result = await service.raw(sql);

  sql = `SELECT count(*) as total from comment as c INNER join users as u on c.userId = u.id where bookId = ${ctx.query.bookId} and c.type = 2`;

  var total = await service.raw(sql);

  result = { body: result[0], total: total[0][0].total };

  ctx.body = result;
})

// router.get('/list', async function (ctx, next) {

//   let sql = `SELECT count(comment.index) as count, comment.index from comment where bookId = ${ctx.query.bookId} and chapterId = ${ctx.query.chapterId} GROUP BY comment.index`;

//   if (ctx.query.index) {
//     sql = `SELECT count(comment.index) as count from comment where bookId = ${ctx.query.bookId} and chapterId = ${ctx.query.chapterId} and comment.index = ${ctx.query.index}`;
//   }

//   var result = await service.raw(sql);

//   ctx.body = result[0];
// })

router.get('/getCommentsByIndex', async function (ctx, next) {

  let sql = `SELECT c.id, u.avatarUrl,u.nickName,c.content,c.createTime from comment as c INNER join users as u on c.userId = u.id where bookId = ${ctx.query.bookId} and chapterId = ${ctx.query.chapterId} and c.index = ${ctx.query.index}`;

  var result = await service.raw(sql);

  ctx.body = result[0];
})

router.get('/alike', async function (ctx, next) {
  var result = await service.column("*").select().from('book').limit(8)
  ctx.body = result;
})

router.post('/add', async function (ctx, next) {
  var record = ctx.request.body;
  var time = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

  await service("comment").insert({ type: record.type, content: record.content, bookId: record.bookId, index: record.index, chapterId: record.chapterId, userId: ctx.request.header["user-id"], createTime: time });
  ctx.body = "ok";
})


router.post('/cancel', async function (ctx, next) {
  var record = ctx.request.body;
  await service("bag").where({ bookId: record.bookId, userId: ctx.request.header["user-id"] }).del();
  ctx.body = "ok";
})


module.exports = router
