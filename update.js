var knex = require("./knex.js")

getBook()

async function getBook() {

  var result = await knex("book").select();

  let temp = [];

  result.map(async (item, index) => {
    console.log(index);
    await createSql(item.id);
  })

}


async function createSql(bookId) {

  return new Promise(async (resolve, reject) => {
    var result = await knex("chapter").select().where({ bookId: bookId });

    result.map(async (item, index) => {
      let str = `update chapter set chapter.index = '${index + 1}' where id = '${item.id}'`;
      knex.raw(str);
    })

    resolve();

  })


}