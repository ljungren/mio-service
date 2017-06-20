'use strict'

const WebClient = require('@slack/client').WebClient,
request = require('request'),
config = require('./config.js')

// declare web client
let web

module.exports = {

  intentClassification: (data) => {
    return new Promise((resolve, reject) => {

      let apiAiRequest =  {
        query: data.event.text, 
        lang:'en',
        originalRequest:
        {
          source:"slack", 
          data: data
        },
        sessionId: data.event.user
      }
        // contexts:[
        //   { 
        //     name: 'weather', 
        //     parameters: {
        //       city: 'London'
        //     }, 
        //     lifespan: 4
        //   }
        // ], 

      request({
        url: "https://api.api.ai/v1/query?v=20150910",
        method: "POST",
        json: true,
        headers: {
            "authorization": "Bearer "+process.env.APIAI_TOKEN,
            "content-type": "application/json; charset=utf-8"
        },
        body: apiAiRequest
      },
      (error, response, body) => {
        if (error) {
          return console.error('request to api.ai failed:', error)
        }
        else if(body){
          if(body.status.code===200){
            console.log('request to api.ai successful!')
            // console.log('api.ai server responded with:', body)

            //update current contexts, etc

            //return slack response
            resolve(body.result.fulfillment.speech)
          }
          else{
            return console.log('status code: '+body.status.code+': '+body.status.errorDetails);
          }
        }
      })
    })
  },
  submitMessage: (text, channel) => {
    //send normal message to slack
    createWebClient()
    return new Promise((resolve, reject) => {
      web.chat.postMessage(channel, text, { as_user: true, replace_original: false}, (err, res) => {
        if (err) {
          console.log('Error:', err)
        } else {
          console.log('Message sent to slack, received:', res.ok ? 'ok' : 'with warning')
          resolve(res.ok)
        }
      })
    })      
  },
  submitRichMessage: (obj, channel) => {
    //send rich message to slack
    createWebClient()
    return new Promise((resolve, reject) => {
      web.chat.postMessage(channel, '', { attachments: obj.attachments, as_user: true, replace_original: false}, (err, res) => {
        if (err) {
          console.log('Error:', err)
        } else {
          console.log('Rich message sent to slack, received:', res.ok ? 'ok' : 'with warning')
          resolve(res.ok)
        }
      })
    })
  },
  openDm: (user_slack_id) => {
    //trigger im_open event with im.open method
    createWebClient()
    return new Promise((resolve, reject) => {
      web.im.open(user_slack_id, (err, res) => {
        if (err) {
          console.log('Error:', err)
        } else {
          console.log('Dm channel opened, response:', res.ok ? 'ok' : 'with warning')
          resolve(res.ok)
        }
      })
    }) 
  }
}

let createWebClient = () => {
  if(web===undefined){
    web = new WebClient(process.env.BOT_TOKEN)
  }
}