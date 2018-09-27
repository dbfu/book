const router = require('koa-router')()
const service = require('../service.js')


router.prefix('/api/users')

router.post('/getUserInfo', async function (ctx, next) {

  var appId = 'wx5b8f9b3499b05e42'

  var result = await require("../util.js").check(appId, ctx.request.body.code, ctx.request.body.encryptedData, ctx.request.body.iv);

  var user = await service.column("*").select().where("openId", result.openId).from('users').first();

  console.log(user)

  if (user) {
    ctx.body = user;
  } else {
    result = { avatarUrl: result.avatarUrl, gender: result.gender, nickName: result.nickName, openId: result.openId };
    var res = await service("users").insert(result).returning("id");
    delete result.openId;
    ctx.body = { ...result, id: res[0] };
  }



  // 解密后的数据为
  //
  // data = {
  //   "nickName": "Band",
  //   "gender": 1,
  //   "language": "zh_CN",
  //   "city": "Guangzhou",
  //   "province": "Guangdong",
  //   "country": "CN",
  //   "avatarUrl": "http://wx.qlogo.cn/mmopen/vi_32/aSKcBBPpibyKNicHNTMM0qJVh8Kjgiak2AHWr8MHM4WgMEm7GFhsf8OYrySdbvAMvTsw3mo8ibKicsnfN5pRjl1p8HQ/0",
  //   "unionId": "ocMvos6NjeKLIBqg5Mr9QjxrP1FA",
  //   "watermark": {
  //     "timestamp": 1477314187,
  //     "appid": "wx4f4bc4dec97d474b"
  //   }
  // }

})

router.get('/bar', function (ctx, next) {
  ctx.body = 'this is a users/bar response'
})

module.exports = router
