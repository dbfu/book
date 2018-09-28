

var request = require("request")
var cheerio = require("cheerio")
var iconv = require("iconv-lite")
var fs = require("fs")


exports.getBookUrls = async function (page = 1, startIndex = 0) {

  return new Promise((resolve, reject) => {
    let url = `http://www.quanben.co/top/toptime_${page}.html`;

    request({ url, encoding: null, }, (error, res, body) => {

      if (error) {
        reject(error);
        return;
      }

      var $ = cheerio.load(iconv.decode(body, "gbk"));

      var trs = $("#views_con_1 table tbody tr");

      let urls = [];

      trs.map((index, item) => {
        if (index >= startIndex) {
          var a = $(item).find("td").eq(1).find("a");
          var url = a.attr("href");
          urls.push(url);
        }
      })

      resolve(urls)
    })
  })

}


exports.getBookInfo = async function (url) {

  return new Promise((resolve, reject) => {

    request({ url, encoding: null, }, (error, res, body) => {


      if (error) {
        fs.appendFileSync(__dirname + "/book-error.txt", url + "\n");
        console.error(error);
        return;
      }

      var $ = cheerio.load(iconv.decode(body, "gbk"));

      var content = $("#content");

      var name = content.find("h1").eq(0).text();
      var imageUrl = content.find(".novel_img img").attr("src");
      var author = content.find(".Sum .novel_msg a").text();
      var type = content.find(".Sum .novel_msg li").eq(3).text();
      console.log(type);
      type = type.split("：")[1].trim();
      // var type = content.find(".Sum .novel_msg li").eq(3).text().split("：")[1].trim();
      var count = content.find(".Sum .novel_msg li").eq(4).text().split("：")[1].trim();
      var desc = $("#description1").text().replace("书籍简介：", "").trim();
      var lastChapterName = $("#vip a").text();

      var url = "http://www.quanben.co" + $(".Sum .button2 a").eq(0).attr("href");
      var book = { name, imageUrl, author, type, count, desc, lastChapterName, url };

      resolve(book);

    })
  })
}

exports.getChapterList = async function (url) {

  return new Promise((resolve, reject) => {

    request({ url, encoding: null, }, (error, res, body) => {

      if (error) {
        return;
      }

      var $ = cheerio.load(iconv.decode(body, "gbk"));

      var list = $(".novel_list a");

      let urls = [];

      list.each((index, item) => {

        let href = $(item).attr("href");

        urls.push({ url: url.replace("index.html", href), path: parseInt(href.replace(".html", "")), name: $(item).text() });

      });

      resolve(urls)

    })
  })

}


exports.getChapterContent = async function (url) {

  return new Promise((resolve, reject) => {

    request({ url, encoding: null, timeout: 15000, pool: { maxSockets: 20 }, }, (error, res, body) => {

      if (error) {
        fs.appendFileSync(__dirname + "/chapter-error.txt", url + "\n");
        reject("error");
        return;
      }

      body = iconv.decode(body, "gbk");

      var $ = cheerio.load(body);

      var content = $(".novel_content").text();

      resolve(content);
    })
  })

}

