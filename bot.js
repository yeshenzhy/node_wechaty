const { Wechaty } = require('wechaty')
const QrcodeTerminal = require('qrcode-terminal')
const cheerio = require('cheerio')
const schedule = require('node-schedule')
const { post, get } = require('./utils/request')
const tools = require('./utils/timeTools')
const config = require('./config/index')

/**
 *
 * 获取图灵机器人消息
 * @param {*} text 传入聊天内容
 * @returns
 */
const getNews = (text) => {
  let resolve, reject;
  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })
  post(config.TULINGURL, {
    reqType:0,
      perception: {
          inputText: {
            text
          },
      },
      userInfo: {
        apiKey: config.TULINGKEY,
        userId: "485b3f76446f8b99"
      }
  })
  .then((res) => {
    if (res.intent.code !=0 && res.intent.code > 10000) {
      resolve(res)
    } else {
      reject(res)
    }
  })
  .catch(res => {
    reject(res)
  })
  return promise
}
// 获取每日一句
const getOne = async() =>{
  // 获取每日一句
  try {
    let res = await get(config.ONE);
    let $ = cheerio.load(res);
    let todayOneList = $('#carousel-one .carousel-inner .item');
    let todayOne = $(todayOneList[0])
      .find('.fp-one-cita')
      .text()
      .replace(/(^\s*)|(\s*$)/g, '');
    return todayOne;
  } catch (err) {
    console.log('错误', err);
    return err;
  }
}
// 获取墨迹天气
const getWeather = async() => {
  let url = config.MOJI_HOST + config.CITY+'/'+config.LOCATION
  let res = await get(url)
  let $ = cheerio.load(res)
  let weatherTips = $('.wea_tips em').text()
  const today = $('.forecast .days').first().find('li');
  let todayInfo = {
      Day:$(today[0]).text().replace(/(^\s*)|(\s*$)/g, ""),
      WeatherText:$(today[1]).text().replace(/(^\s*)|(\s*$)/g, ""),
      Temp:$(today[2]).text().replace(/(^\s*)|(\s*$)/g, ""),
      Wind:$(today[3]).find('em').text().replace(/(^\s*)|(\s*$)/g, ""),
      WindLevel:$(today[3]).find('b').text().replace(/(^\s*)|(\s*$)/g, ""),
      PollutionLevel:$(today[4]).find('strong').text().replace(/(^\s*)|(\s*$)/g, "")
  }
  let obj = {
    weatherTips:weatherTips,
    todayWeather:todayInfo.Day + ':' + todayInfo.WeatherText + '<br>' + '温度:' + todayInfo.Temp +  '<br>'
        + todayInfo.Wind + todayInfo.WindLevel + '<br>' + '空气:' + todayInfo.PollutionLevel + '<br>'
  }
  return  obj

}
// 定时任务
const main = async() => {
  let  contact = await bot.Contact.find({name:config.NICKNAME}) || await bot.Contact.find({alias:config.NAME}) // 获取你要发送的联系人
  let one = await getOne() //获取每日一句
  let weather = await getWeather() //获取天气信息
  let today = await tools.formatDate(new Date())//获取今天的日期
  let memorialDay = tools.getDay(config.MEMORIAL_DAY)//获取纪念日天数
  let str = today + '<br>' + '今天是我们在一起的第' + memorialDay + '天'
      + '<br><br>今日天气早知道<br><br>' + weather.weatherTips +'<br><br>' +weather.todayWeather+ '每日一句:<br><br>'+one+'<br><br>'+'------来自最爱你的我'
  await contact.say(str)//发送消息
}

//  二维码生成
const onScan = (qrcode, code) => {
  QrcodeTerminal.generate(qrcode) // 在console端显示二维码
  const qrcodeImageUrl = [
    'https://api.qrserver.com/v1/create-qr-code/?data=',
    encodeURIComponent(qrcode),
  ].join('')
  console.log(qrcodeImageUrl)
}
// 登录
const onLogin = (user) => {
  console.log(`User ${user} logined`)
  schedule.scheduleJob(config.SENDDATE, () => {
    console.log('小助理开始工作啦！')
    main()
  })
}
// 登出
const onLogout = (user) => {
  console.log(`User ${user} 登出`)
}
// 监听消息
/**
 *
 *
 * @param {*} message 消息
 */
const onMessage = async(message) => {
  const contact = message.from() // 发消息人
  const content = message.text().trim() // 消息内容
  const room = message.room() // 是否是群消息
  const alias = await contact.alias(); // 发消息人备注
  const isText = message.type() === bot.Message.Type.Text; // 是否是文字
  if (content === '开启:') { // 通过输入内容开启关闭图灵机器人
    config.AUTOREPLY = true
  } else if (content === '关闭:'){
    config.AUTOREPLY = false
  }
  if (message.self()) {
    return
  }
  if (room && isText) {
    // 如果是群消息 目前只处理文字消息
    const topic = await room.topic();
    console.log(`群名: ${topic} 发消息人: ${contact.name()} 内容: ${content}`);
  } else if (isText) {
    // 如果非群消息 目前只处理文字消息
    console.log(`发消息人: ${alias} 消息内容: ${content}`);
    if(alias == config.NAME) {
      if (config.AUTOREPLY) {
        const news = await getNews(content).catch(err => console.log(err,'机器人接口出错啦'))
        await message.say(news.results[0].values.text)
      }
    }
    
  }
}
const bot = new Wechaty({ name: 'yeshen' });

bot.on('scan', onScan)
  .on('login', onLogin)
  .on('logout', onLogout)
  .on('message', onMessage)

bot.start()
   .then(() => console.log('开始登录微信'))
   .catch(err => console.error(err))
