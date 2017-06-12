const WebClient = require('@slack/client').WebClient,
request = require('request'),
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
          if(body.status.code===200){
            console.log('request to api.ai successful!')
            // console.log('api.ai server responded with:', body)

            //update current contexts, etc

            //return slack response
            resolve(body.result.fulfillment.speech)
          }
          else{
            console.log('status code: '+body.status.code+': '+body.status.errorDetails);
            resolve('sorry, something went wrong with processing your query')
          }
        }
      })
    })
  },
  submitMessage: (text, initialReq) => {
    //send message to slack

    // console.log('text: '+text)
    // console.log('initialReq: '+JSON.stringify(initialReq))

    let web = new WebClient(config.slack.web_token)
    web.chat.postMessage(initialReq.event.channel, text, (err, res) => {
      if (err) {
        console.log('Error:', err)
      } else {
        console.log('Message recieved', res.ok ? 'ok' : 'with warning')
      }
    })
  }
}