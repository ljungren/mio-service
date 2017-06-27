'use strict'

//inport modules
const db = require('./db.js'),
request = require('request'),
comm = require('../comm.js')
//import example data
const btnRes = require('../data/contact-and-info.js'),
  contextRes = require('../data/context-response.js'),
  fallback = require('../data/fallback.js'),
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
  introMess: (user) => {
    return new Promise((resolve, reject) => {
      console.log('sending personalized intro response')
      resolve((user.user_current_context===null || user.user_current_context===undefined) ? greeting.unknown(user.user_name) : greeting.known(user.user_name, user.user_current_context))

    }).catch((err) => {
      console.log('err: user request not valid')
    })
  },
  contextMess: (user_slack_id) => {
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
  },
  getContext: (user_slack_id) => {
    return new Promise((resolve, reject) => {
      db.getUser(user_slack_id).then((user) => {
        if(user){
          resolve(user.user_current_context)
        }
      })
    }).catch((err) => {
      console.log('err: something went wrong with retreiving context')
    })
  },
  updateSessionContexts: (session_id, user_session_contexts) => {
    return new Promise((resolve, reject) => {
      db.updateUserSession(session_id, user_session_contexts).then((ok)=> {
        resolve(ok)
      })
    }).catch((err) => {
      console.log('err: something went wrong with updating session in db')
    })
  },
  restoreSession: (session_id) => {
    return restoreUserSession(session_id)
  },
  saveLatestMessage: (slack_id, message) => {
    return new Promise((resolve, reject) => {
      db.updateLatestMessage(slack_id, message).then((ok)=>{
        // restoreUserSession(slack_id)
        resolve(ok)
      })
    })
  },
  fallbackMess: (session_id) => {
    return new Promise((resolve, reject) => {
      getUserSessionFromApiAi(session_id).then((user_session_contexts) => {
        if(user_session_contexts.length>0){
          console.log('Sending regular fallback response')
          resolve(fallback.regular())
        }
        else{
          restoreUserSession(session_id).then((contexts)=>{
            console.log('contexts length: '+contexts.length)
              // if(contexts.length>0){
              if(contexts.length>0){
                console.log('API.AI session was restored')
                //send latest message again, only if the session restore worked
                db.getUser(session_id).then((user)=>{
                  console.log('RISSUING LATEST MESSAGE')
                  console.log('user latest message: '+JSON.stringify(user.user_latest_message))
                  if(user){
                    comm.intentClassification(user.user_latest_message).then((response)=> {
                      console.log('intentClassification CONTEXT: '+response[1])
                      if(!(response===null || response===undefined)){
                        console.log('sending api.ai response to slack')
                        db.updateUserSession(response[1]).then(()=>{
                          resolve(response[0])
                        })
                      }
                    })
                  }
                  else{
                    resolve('timeout')
                  }
                })
              }
              else{
                console.log('session was not restored, returning error')
                resolve('timeout')
              }
          })
        }
      })
    }).catch((err) => {
      console.log('err: something went wrong with getting session fallback response')
    })
  },
  getUserDmId: (id) => {
    return findUserDmId(id)
  }
}

let restoreUserSession = (session_id) => {
  return new Promise((resolve, reject) => {
    // get session from db
    // POST to api.ai and restore session contexts
    // resolve context array
    console.log('session_id restore: '+session_id)
    db.getUser(session_id).then((user)=>{
      console.log('user contexts: '+JSON.stringify(user.user_session_contexts))
      request({
        url: "https://api.api.ai/v1/contexts?sessionId="+session_id,
        method: "POST",
        json: true,
        headers: {
            "authorization": "Bearer "+process.env.APIAI_TOKEN,
            "content-type": "application/json; charset=utf-8"
        },
        body: user.user_session_contexts
      },
      (error, response, body) => {
        if (error) {
          return console.error('request to api.ai failed:', error)
        }
        else if(body){
          console.log('session post request to api.ai successful!')
          console.log('api.ai server responded with:', body.names)
          resolve(body.names)
        }
      })
    })
  })
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

let getUserSessionFromApiAi = (session_id) => {
  return new Promise((resolve, reject) => {
    console.log('sending apiai session info request')
    request({
      url: "https://api.api.ai/v1/contexts?sessionId="+session_id,
      method: "GET",
      json: true,
      headers: {
          "authorization": "Bearer "+process.env.APIAI_TOKEN,
          "content-type": "application/json; charset=utf-8"
      }
    },
    (error, response, body) => {
      if (error) {
        return console.error('session request to api.ai failed:', error)
      }
      else if(body){
        console.log('session request to api.ai successful!')
        // console.log('api.ai server responded with:', body)
        //return session
        resolve(body)
      }
    })
  })
}

let findUserDmId = (slack_id) => {
  return new Promise((resolve, reject) => {
    console.log('sending slack user info request')
    request(
      { 
        method: 'GET',
        uri: 'https://slack.com/api/im.list?token='+process.env.BOT_TOKEN
      }
    )
    .on('error', () => {
      console.log('error in slack user info request')
    })
    .on('data', (data) => {
      console.log('recieved slack user info')
      console.log(data);
      let ims = data.ims
      for(var i=0;i<ims.length;i++){
        if(ims[i].user===slack_id){
          resolve(ims[i].id)
        }
      }
    })
  })
}