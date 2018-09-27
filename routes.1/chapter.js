const router = require('koa-router')()
const service = require('../service.js')
const path = require("path")
const fs = require("fs")

router.prefix('/api/chapter')

router.get('/list', async function (ctx, next) {
  var record = await service("record").column("chapterId").select().where({ bookId: ctx.query.bookId, userId: ctx.request.header["user-id"] }).first();

  if (record) {
    var chapter = await service.column("index").select().where({ id: record.chapterId }).from('chapter').first();
    var total = await service.count("*").select().where({ bookId: ctx.query.bookId }).from('chapter');

    let index = parseInt((chapter.index) / 101);

    if (ctx.query.sort == 0) {
      index = parseInt((total[0]["count(*)"] - chapter.index) / 101);
    }

    var result = await service.column("id", "name").select().where({ bookId: ctx.query.bookId }).from('chapter').orderBy("sort", ctx.query.sort == 1 ? "asc" : "desc").offset(index * 100).limit(100);

    ctx.body = { list: result, chapterId: record ? record.chapterId : 0, index: index + 1, total: total[0]["count(*)"] };
  } else {

    var total = await service.count("*").select().where({ bookId: ctx.query.bookId }).from('chapter');

    let index = 0;

    if (ctx.query.sort == 0) {
      index = parseInt((total[0]["count(*)"] - index) / 101);
    }

    var result = await service.column("id", "name").select().where({ bookId: ctx.query.bookId }).from('chapter').orderBy("sort", ctx.query.sort == 1 ? "asc" : "desc").offset(index * 100).limit(100);

    ctx.body = { list: result, chapterId: 0, index: index + 1, total: total[0]["count(*)"] };
  }

})


router.get('/query', async function (ctx, next) {

  var result = await service.column("id", "name").select().where({ bookId: ctx.query.bookId }).from('chapter').orderBy("sort", ctx.query.sort == 1 ? "asc" : "desc").offset(ctx.query.pageIndex * 100).limit(100);

  ctx.body = { list: result };

})


router.get('/content', async function (ctx, next) {

  if (!!Number(ctx.query.id)) {
    var result = await service.column("id", "path", "name", "sort").select().where({ id: ctx.query.id }).from('chapter').first();

    result.content = getChapterContent(result.path);

    var record = await service("record").where({ bookId: ctx.query.bookId, userId: ctx.request.header["user-id"] }).first();

    if (record) {
      await service("record").where({ id: record.id }).update({ chapterId: ctx.query.id });
    } else {
      await service("record").insert({ chapterId: ctx.query.id, bookId: ctx.query.bookId, userId: ctx.request.header["user-id"] });
    }

    ctx.body = result;
  } else {

    var chapterId = await service.column("chapterId").select().where({ bookId: ctx.query.bookId, userId: ctx.request.header["user-id"] }).from('record').first();


    var result = {};
    if (chapterId) {
      result = await service.column("id", "path", "name", "sort").select().where({ id: chapterId.chapterId }).from('chapter').first();

      result.content = getChapterContent(result.path);
    } else {
      result = await service.column("id", "path", "name", "sort").select().where({ bookId: ctx.query.bookId }).from('chapter').orderBy("sort").limit(1).first();

      result.content = getChapterContent(result.path);

      await service("record").insert({ chapterId: result.id, bookId: ctx.query.bookId, userId: ctx.request.header["user-id"] });
    }

    ctx.body = result;
  }

})

router.get('/next', async function (ctx, next) {


  let sort = parseInt(ctx.query.sort);
  sort += 1;
  var cacheChapter = await service.column("id", "path", "name", "sort").select().where({ sort: sort }).from('chapter').first();


  while (!cacheChapter) {
    sort += 1;
    cacheChapter = await service.column("id", "path", "name", "sort").select().where({ sort: sort }).from('chapter').first();
  }

  cacheChapter.content = getChapterContent(cacheChapter.path);


  // var nextChapter = await service.column("id", "content", "name", "sort").select().where({ sort: result.sort + 1 }).from('chapter').first();
  if (ctx.query.id) {
    await service("record").where({ bookId: ctx.query.bookId, userId: ctx.request.header["user-id"] }).update({ chapterId: ctx.query.id });
  }



  ctx.body = cacheChapter;
})

router.post('/add', async function (ctx, next) {
  var record = ctx.request.body;
  await service("chapter").insert(record);
  ctx.body = "ok";
})

function getChapterContent(chapterPath) {
  chapterPath = path.join(__dirname, "..", chapterPath);
  return fs.readFileSync(chapterPath, "utf-8");
}

module.exports = router
