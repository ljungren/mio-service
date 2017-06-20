'use strict'

//inport modules
const db = require('./db.js'),
request = require('request')
//import example data
const btnRes = require('../data/contact-and-info.js'),
  contextRes = require('../data/context-response.js'),
  greeting = require('../data/greeting.js'),
  sliperiet = require('../data/sliperiet.js'),
  northern = require('../data/northern.js'),
  housebe = require('../data/housebe.js'),
  lounge = require('../data/lounge.js')

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
        addUserDetails(user, user_slack_id).then((usr) => {
          resolve(usr)
          //add user if not exists
          if(usr && !(usr===undefined)){
            if(usr.insert){
              db.addUser(usr.user_slack_id, usr.user_name)
              console.log('adding new user to db')
            }
            else{
              console.log('user already in db: '+usr.user_name)
            }
          }
        })
      })
    })
  },
  intro: (user) => {
    return new Promise((resolve, reject) => {
      console.log('sending personalized intro response')
      resolve((user.user_current_context===null || user.user_current_context===undefined) ? greeting.unknown(user.user_name) : greeting.known(user.user_name, user.user_current_context))

    }).catch((err) => {
      console.log('err: user request not valid')
    })
  },
  context: (user_slack_id) => {
    return new Promise((resolve, reject) => {
      db.getUser(user_slack_id).then((user) => {
        if(user){
          let response = (user.user_current_context ? contextRes.existing_context(user.user_current_context) : contextRes.new_search())
          resolve(response)
        }
      })
    }).catch((err) => {
      console.log('err: something went wrong with sending context response')
    })
  },
  updateContext: (user_slack_id, context) => {
    return new Promise((resolve, reject) => {
      db.getUser(user_slack_id).then((user) => {
        db.updateUser(user_slack_id, user.user_name, context)
      }).catch((err) => {
      console.log('err: context could not be updated')
      })
    })
  }
}

let addUserDetails = (user, slack_id) => {
  return new Promise((resolve, reject) => {
    getSlackUserInfo(slack_id).then((info) => {
      // get user info from slack
      if(info.ok){
        //slack req ok
        if(user){
          //user exists in db
          user['insert'] = false
          if(user.user_name===null || user.user_name===undefined || user.user_name===""){
            // complement user name, if no name
            console.log('adding user name')
            user.user_name = info.user.profile.first_name
            db.updateUser(user.user_slack_id, user.user_name)
          }
        }
        else{
          //user is not in db, create user object
          console.log('user is not in db, creating user...')
          user = {
            user_slack_id: slack_id,
            user_name: info.user.profile.first_name,
            insert: true
          }
        }
      }
      else{
        console.log('slack_id not found in team')
      }
      resolve(user)
      return user
    })
  })
}

let getSlackUserInfo = (slack_id) => {
  return new Promise((resolve, reject) => {
    console.log('sending slack user info request')
    request(
      { 
        method: 'GET',
        uri: 'https://slack.com/api/users.info?token='+process.env.WEB_TOKEN+'&user='+slack_id
      }
    )
    .on('error', () => {
      console.log('error in slack user info request')
    })
    .on('data', (data) => {
      console.log('recieved slack user info');
      resolve(JSON.parse(data))
    })
  })
}