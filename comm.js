const request = require('request'),
config = require('./config.js')

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
            "authorization": "Bearer "+config.apiai_access_token,
            "content-type": "application/json; charset=utf-8"
        },
        body: apiAiRequest
      },
      (error, response, body) => {
        if (error) {
          return console.error('request to api.ai failed:', error)
        }
        else if(body){
          console.log('request to api.ai successful!')
          // console.log('api.ai server responded with:', body)
          //update current contexts, etc

          //return slack response
          resolve(body.result.fulfillment.speech)
        }
      })
    })
  },
  submitMessage: (text, initialReq) => {
    //send message to slack

    // console.log('text: '+text)
    // console.log('initialReq: '+JSON.stringify(initialReq))

    let slackMessage = {
      token: config.slack.web_token,
      channel: initialReq.event.channel,
      text: text
    }
    request({
      url: 'https://slack.com/api/chat.postMessage',
      method: "POST",
      json: true,
      headers: {
          "content-type": "application/json; charset=utf-8"
      },
      body: slackMessage
    },
    (error, response, body) => {
      if (error) {
        return console.error('chat.postMessage failed:', error)
      }
      else if(body){
        return console.log('chat.postMessage: '+JSON.stringify(body))
      }
      
    })
  }
}