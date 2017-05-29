'use strict';

//import modules
const express  = require('express'),
  bodyParser = require('body-parser'),
  service = express(),
  request = require('request'),
  pg = require('pg'),
  actions = require('./actions/actions.js')

//middleware
service.use(bodyParser.urlencoded({ extended: true }))
service.use(bodyParser.json())
service.use((req, res, next) => {
  console.log(req.method, req.url)
  next()
})

//routes
service.get('/', (req,res,next) => {
  return res.status(200).send('api available')
})


// INVOKE WITH: api.ai webhook (test: "dinosaur")
service.post('/search', (req,res,next) => {

  // (print request) console.log('data:'+ JSON.stringify(req.body));
  let data = req.body
  let action = data.result.action
  let user_slack_id = data.originalRequest.data.event.user

  getResponse(action, null, user_slack_id).then((response) => {
    return res.json({speech: response, source: "mio-service"})
    //return res.json({speech: "I cannot reply to this yet "+response+". It's really just dummy data :angel: \n", source: "mio-service"})
  })
})

// INVOKE WITH: message buttons
service.post('/interaction', (req,res,next) => {

  // (print request) console.log('payload:'+ JSON.stringify(req.body.payload));
  let data = JSON.parse(req.body.payload)

  let action = data.actions[0].value
  let context = data.callback_id
  console.log(context + ': ' + action)

  let response = getResponse(action, context)  
  // response.prototype.speech = 'What do you think?'
  return res.status(200).send(response)
})

//functions

let getResponse = (action, context, param1=null, param2=null) => {
    switch(action){
    case 'contact':
      console.log('contact info requested')
      return actions.contact(context)
      break
    case 'more':
      console.log('more info requested')
      return actions.moreInfo(context)
      break
    case 'next':
      console.log('new search requested')
      return actions.showNext(context)
      break
    case 'smalltalk.greetings.hello':
      console.log('user said hello')      
      //if known user, say "Hi Joakim! welcome back", else, instructions
      return new Promise((resolve, reject)=>{
        actions.identify(param1).then((user)=>{
          actions.hello(user).then((response) => {
            resolve(response)
          })
        })
      })
      break
    case 'identify_user':
      console.log('identify user')
      return actions.identify(param1)
      break
    case 'location_search':
      //user searched for office
      console.log('searched again via text')
      //doResponse with current context and action:next
      break
    case 'relevance_ask':
      console.log('relevance was asked')
      break
    default:
      console.log('no action value found')
  }
}


//start Server
const server = service.listen((process.env.PORT || 9000), () => {

  console.log("Listening to port %s",server.address().port)

  // ssl in production
  pg.defaults.ssl = server.address().port===9000 ? false : true;

  //set up alive messaging
  setInterval(() => {
    request('https://mio-service.herokuapp.com/', function (error, response, body) {
      console.log('alive_error: ' + error);
      console.log('alive_status_code: ' + response && response.statusCode);
      console.log('alive_message: ' + body);
    })
  }, 1200000)

})

