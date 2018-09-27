
const router = require('koa-router')()
const service = require('../service.js')
const moment = require('moment')

router.prefix('/api/reply')

router.get('/list', async function (ctx, next) {

  let sql = `SELECT c.id, u.avatarUrl, u.nickName, c.content, c.createTime from reply as c INNER join users as u on c.userId = u.id where c.commentId = ${ctx.query.commentId}`;

  var result = await service.raw(sql);

  var total = await service("reply").count("id as total").where({ commentId: ctx.query.commentId });

  ctx.body = { rows: result[0] || [], total: total[0].total };
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

  await service("reply").insert({ content: record.content, userId: ctx.request.header["user-id"], createTime: time, commentId: record.commentId });

  await service.raw(`update comment set replyCount=replyCount+1 where id = ${record.commentId}`);

  ctx.body = "ok";
})


router.post('/cancel', async function (ctx, next) {
  var record = ctx.request.body;
  await service("bag").where({ bookId: record.bookId, userId: ctx.request.header["user-id"] }).del();
  ctx.body = "ok";
})


module.exports = router
