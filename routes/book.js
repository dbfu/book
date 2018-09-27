const router = require('koa-router')()
const service = require('../service.js')

router.prefix('/api/book')

router.get('/list', async function (ctx, next) {

  let page = ctx.query.page || 0;
  let size = ctx.query.size || 10;
  let type = ctx.query.type;

  let sort = "clickCount"
  if (type == "collect") {
    sort = "collectCount";
  } else if (type == "recommend") {
    sort = "recommendCount";
  } else if (type == "search") {
    sort = "searchCount";
  } else if (type == "number") {
    sort = "count";
  } else {
    sort = "clickCount";
  }

  result = await service.column("*").select().orderByRaw(`${sort} desc, id asc`).offset(page * size).limit(size).from('book');

  ctx.body = result;
})

router.get('/query/:id', async function (ctx, next) {

  let result = await service.column("*").select().where("id", ctx.params.id).from('book').first();

  // var count = await service.where("bookId", ctx.params.id).count("id as chapterLength").from('chapter').first();

  var book = await service.where({ "userId": ctx.request.header["user-id"], "bookId": ctx.params.id }).from('record').first();

  var recommend = await service.where({ "userId": ctx.request.header["user-id"], "bookId": ctx.params.id }).from('recommend').count("id as count").first();

  await service.raw("update book set clickCount = clickCount + 1 where id = " + ctx.params.id);

  var bag = await service.where({ "userId": ctx.request.header["user-id"], "bookId": ctx.params.id }).from('bag').first();

  result = { ...result, count: result.chapterLength, isCollect: !!bag, chapterId: book ? book.chapterId : 0, isRecommend: !!(recommend.count) };

  ctx.body = result;
})

router.get('/alike', async function (ctx, next) {
  var result = await service.column("*").select().from('book').limit(8)
  ctx.body = result;
})

router.get('/search', async function (ctx, next) {

  var result = await service.raw(`select * from book where name like '%${ctx.query.keyWord}%'`);

  ctx.body = result[0];
})

router.post('/addSearch', async function (ctx, next) {

  var record = ctx.request.body;

  await service.raw("update book set searchCount = searchCount + 1 where id = " + record.bookId);

  ctx.body = record;
})

router.post('/add', async function (ctx, next) {
  var record = ctx.request.body;
  var ids = await service("book").insert(record).returning("id");
  ctx.body = ids[0];
})


module.exports = router
