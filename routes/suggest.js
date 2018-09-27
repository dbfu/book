
const router = require('koa-router')()
const service = require('../service.js')
const moment = require('moment')

router.prefix('/api/suggest')

router.get('/list', async function (ctx, next) {

  let sql = `SELECT c.id, u.avatarUrl, u.nickName, c.content, c.createTime from reply as c INNER join users as u on c.userId = u.id where c.commentId = ${ctx.query.commentId}`;

  var result = await service.raw(sql);

  var total = await service("reply").count("id as total").where({ commentId: ctx.query.commentId });

  ctx.body = { rows: result[0] || [], total: total[0].total };
})


router.post('/add', async function (ctx, next) {
  var record = ctx.request.body;
  var time = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

  await service("suggest").insert({ content: record.content, userId: ctx.request.header["user-id"], createTime: time });

  // await service.raw(`update comment set replyCount=replyCount+1 where id = ${record.commentId}`);

  ctx.body = "ok";
})


module.exports = router
