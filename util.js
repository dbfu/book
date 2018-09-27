
var WXBizDataCrypt = require('./WXBizDataCrypt')
exports.check = function (appId, code, encryptedData, iv) {

  console.log(code);
  return new Promise((resolve) => {
    var url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=f82fb2009bcb53654d2080150be02255&js_code=${code}&grant_type=authorization_code`;

    require("request").get(url, function (err, res, body) {

      body = JSON.parse(body);

      console.log(body);

      var sessionKey = body.session_key;

      var pc = new WXBizDataCrypt(appId, sessionKey)

      var data = pc.decryptData(encryptedData, iv)

      console.log('解密后 data: ', data)

      resolve(data);
    })
  })
}