var service = require("./core.js")
var fs = require("fs")
var knex = require("./knex.js")
const readline = require('readline');
var uuid = require('node-uuid');
var request = require("request");

let page = 1;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});



async function addBook(urls, index = 0) {

  var book = await service.getBookInfo(urls[index]);

  let bookUrl = book.url;
  delete book.url;

  let path = await downloadImage(book.imageUrl);

  book.imageUrl = path;

  let result = await knex("book").insert(book).returning("id");

  if (!fs.existsSync(__dirname + "/book/" + result[0])) {
    fs.mkdirSync(__dirname + "/book/" + result[0]);
  }

  var chapters = await service.getChapterList(bookUrl);

  getBookInfo(0, chapters, result[0], () => {
    if (index == urls.length - 1) {
      if (page >= 50) {
        rl.question('Has reached 50, will it continue?', (answer) => {
          if (answer == "yes" || answer == "y") {
            page += 1;
            getBookUrls();
          }
          rl.close();
        });
      }
    } else {
      console.log("start get new book " + (index + 1));
      addBook(urls, index + 1);
    }
  });
}


async function getBookInfo(i, chapters, bookId, callback) {
  let chapter = chapters[i];

  // console.log("get chapter" + (i + 1));

  try {
    var content = await service.getChapterContent(chapter.url);

    let path = "/book/" + bookId + "/" + (i + 1) + ".txt";

    await knex("chapter").insert({
      name: chapter.name,
      sort: chapter.path,
      path: path,
      bookId: bookId
    });

    fs.writeFileSync(__dirname + path, content);

    if (i == chapters.length - 1) {
      callback();
    } else {
      getBookInfo(i + 1, chapters, bookId, callback);
    }

  } catch (err) {
    getBookInfo(i, chapters, bookId, callback)
  }
}

async function getBookUrls() {
  console.log("start get new page " + page);
  var urls = await service.getBookUrls(page);
  addBook(urls, 0);
}


function downloadImage(url) {
  return new Promise((resolve, reject) => {
    var options = {
      url: url,
      encoding: null
    };
    var uidv4 = uuid.v4();
    let path = "/images/" + uidv4 + ".png";
    request(options, function (error, response, buffer) {
      if (!error) {
        fs.writeFile(__dirname + "/public" + path, buffer, function (err) {
          resolve(path);
        });
      }
    });
  })
}

test();

// getBookUrls();


async function test() {

  var result = await knex("chapter").select().where({ bookId: 294 });

  let temp = [];
  result.map((item, index) => {
    let str = `update chapter set chapter.index = ${index + 1} where id = ${item.id};`;
    temp.push(str);
  })

  str = temp.join("\n");

  require("fs").writeFile(__dirname + "/test.sql", str);

}
