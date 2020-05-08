## 介绍
本项目主要是node wechaty的一个小应用，其核心原理主要通过wechaty插件登录网页版微信接受消息进行通信以及其他功能等。这里只做了聊天接收展示，图灵机器人接入指定人聊天，通过爬虫每日一说，墨迹天气定时给指定人发送消息等

## 运行参考package.json中命令配置
没装yarn 的可以使用npm

安装依赖 yarn install

运行yarn start

## 功能
1. 登录后可在微信发送 
'开启:' 开启图灵机器人聊天(可指定人)
'关闭:' 关闭灵机器人聊天

2. 定时给女友发送暖心问候
1.墨迹天气
2.每日一句

## 项目配置
所有配置项均在 config/index.js文件中
// 配置文件
module.exports = {
  NAME: 'xxx', //女朋友备注姓名
  NICKNAME: 'xxx', //女朋友昵称
  MEMORIAL_DAY: '2017/05/11', //你和女朋友的纪念日
  SENDDATE: '00 00 08 * * *', //定时发送时间 每天8点0分0秒发送，规则见 npm schedule
  MOJI_HOST: 'https://tianqi.moji.com/weather/china/',
  CITY:'shaanxi',//收信者所在城市
  LOCATION:'yanta-district',//收信者所在区
  ONE: 'http://wufazhuce.com/',
  //图灵机器人功能配置项
  AUTOREPLY: false, //自动聊天功能 默认关闭 开启设置为: true
  TULINGURL: 'http://openapi.tuling123.com/openapi/api/v2',
  TULINGKEY: '',//图灵机器人apikey,需要自己到图灵机器人官网申请，并且需要认证http://www.turingapi.com/

}