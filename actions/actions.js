//inport modules
const db = require('./db.js'),
request = require('request'),
config = require('../config.js')
//import example data
const btnRes = require('../data/contact-and-info.js'),
  greeting = require('../data/greeting.js'),
  sliperiet = require('../data/sliperiet.json'),
  northern = require('../data/northern.json'),
  housebe = require('../data/housebe.json'),
  lounge = require('../data/lounge.json')

module.exports = {
  contact: (context) => {
    //return object based on context
    let res = {
      replace_original: false,
      text: ""
    }
    switch(context){
      case 'sliperiet_action':
        res.text = btnRes.sliperiet.contact
        break
      case 'northern_action':
        res.text = btnRes.northern.contact
        break
      case 'house_action':
        res.text = btnRes.housebe.contact
        break
      case 'lounge_action':
        res.text = btnRes.housebe.contact
        break
    }
    return res
  },
  moreInfo: (context) => {
    //return object based on context
    let res = {
      replace_original: false,
      text: ""
    }
    switch(context){
      case 'sliperiet_action':
        res.text = btnRes.sliperiet.info
        break
      case 'northern_action':
        res.text = btnRes.northern.info
        break
      case 'house_action':
        res.text = btnRes.housebe.info
        break
      case 'lounge_action':
        res.text = btnRes.lounge.info
        break
    }
    return res
  },
  showNext: (context) => {
    //return object based on context
    switch(context){
      case 'sliperiet_action':
        return northern
        break
      case 'northern_action':
        return housebe
        break
      case 'house_action':
        return lounge
        break
    }
    return sliperiet
  },
  identify: (user_slack_id) => {
    //returns user name or null
    return new Promise((resolve, reject) => {
      db.getUser(user_slack_id).then((user) => {

        //respond with user, null if not exist
        resolve(user)

        //pass user to info complementation
        return user

      }).then((user) => {
        // if no name available, get user info from slack 
        if(user){
          if(user.user_name===null || user.user_name===undefined){
            getSlackUserInfo(user_slack_id).then((info) => {
              // complement user info
              user.user_name = info.user.name
              //pass user to db insert
              return user
            })
          }
        }
      })
      // .then((user) => {
      //   //add user if not exists
      //   console.log('user: '+JSON.stringify(user))
      //   if(!user){
      //     //db.addUser(user_slack_id)
      //     console.log('Adding new user to db');
      //   }
      //   else{
      //     console.log('User already in db: '+user.user_name);
      //   }
      // })
    })
  },
  hello: (user) => {
    return new Promise((resolve, reject) => {
      // console.log('user exists in hello?: '+ !(user===null))
      resolve(user===null ? greeting.unknown : greeting.known(user.user_name, user.user_current_context)) 
    })
  }
}

let getSlackUserInfo = (slack_id) => {
  console.log(slack_id);
  return new Promise((resolve, reject) => {
    request(
      { 
        method: 'GET',
        uri: 'https://slack.com/api/users.info?token='+config.slack_token+'&user='+slack_id
      }
    )
    .on('data', (data) => {
      // decompressed data as it is received
      console.log('decoded chunk: ' + data)
      resolve(JSON.parse(data))
    })
  })
}