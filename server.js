'use strict'

//import modules
const express  = require('express'),
  bodyParser = require('body-parser'),
  service = express(),
  request = require('request'),
  RtmClient = require('@slack/client').RtmClient,
  RTM_EVENTS = require('@slack/client').RTM_EVENTS;
  // apiai = require('apiai'),
  pg = require('pg'),
  actions = require('./actions/actions.js'),
  comm = require('./comm.js'),
  config = require('./config.js')

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

//INVOKES FROM SLACK MESSAGE
service.post('/message', (req,res,next) => {

  //console.log('data:'+ JSON.stringify(req.body))
  let data = req.body

  // identify request origin
  if('challenge' in data){
    console.log('slack authentication')
    return res.status(200).send(req.body.challenge)
  }
  else if('token' in data && data.token===config.slack.event_token){
    //event call is ok
    res.status('200').send()

    var rtm = new RtmClient(config.slack.bot_token)
    rtm.start()
    // you need to wait for the client to fully connect before you can send messages
    rtm.on(RTM_EVENTS.RTM_CONNECTION_OPENED, () => {
      rtm.sendTyping(data.event.channel)
      // rtm._send({id: 1,
      //   type: "typing",
      //   channel: "CHANNEL_ID"
      // })
    })   

    console.log('post from slack, event type: '+data.event.type)
    // console.log('data: '+JSON.stringify(data))

    //extract events and do something if not normal message

    //send message as req to to api.ai for intent classification.
    console.log('passing message to api.ai for intent classification');
    comm.intentClassification(data).then((response)=> {
      // console.log('response: '+response);

      console.log('sending api.ai response to slack');
      comm.submitMessage(response, data)
    })
  }
  else if(!('token' in data || data.token===config.slack.event_token)){
    res.status('401').send('Unauthorized request')
  }
  else{
    res.status('400').send('Bad request')
  }
})



// INVOKES FROM API.AI INTENT FULFILLMENT
service.post('/webhook', (req,res,next) => {

  let data = req.body

  console.log('webhook fulfillment request from api.ai')
  // console.log('webhook req.body: '+JSON.stringify(req.body))

  //get params
  let action = data.result.action
  let user_slack_id = data.sessionId

  let obj = getResponse(action, null, user_slack_id)

  if(obj instanceof Promise){
    obj.then((response) => {
      return response ? res.json({speech: response, source: "mio-service"}) : res.json({speech: "Sorry, I cannot reply to this yet :angel: \n", source: "mio-service"})
      // return response ? res.status(200).send(response) : res.status(200).send("Sorry, either you ar an invalid user or I cannot reply to this yet :angel: \n")
    })
  }
  else{
    return obj ? res.json({speech: obj, source: "mio-service"}) : obj.json({speech: "Sorry, I cannot reply to this yet :angel: \n", source: "mio-service"})
  }

})


// INVOKES FROM INTERACTIVE MESSAGE BUTTONS
service.post('/interaction', (req,res,next) => {

  // console.log('payload:'+ JSON.stringify(req.body.payload));
  let data = JSON.parse(req.body.payload)

  let action = data.actions[0].value
  let context = data.callback_id
  console.log(context + ': ' + action)

  let response = getResponse(action, context)  
  // response.prototype.speech = 'What do you think?'
  return res.status(200).send(response)
})



//get response or action based on custom events
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
      // getResponse('location_search', context, param1)
      return actions.showNext(context)
      break
    case 'smalltalk.greetings.hello':
      console.log('user said hello')      
      //if new user, give introduction, otherwise continue on current context
      return getIntro(action, context, param1)
      break
    case 'identify_user':
      console.log('identify user')
      return actions.identify(param1)
      break
    case 'location_search':
      //user searched for office
      console.log('searched location')
      return actions.showNext(context)
      break
    case 'relevance_ask':
      console.log('relevance was asked')
      break
    default:
      console.log('no specific action, calling api.ai')
      //return callApiAi()
  }
}

let getIntro = (action, context, param1) => {
  return new Promise((resolve, reject)=>{
    actions.identify(param1).then((user)=>{
      actions.intro(user).then((response) => {
        resolve(response)
      })
    })
  })
}




//start Server
const server = service.listen((process.env.PORT || 9000), () => {

  console.log("Listening to port %s",server.address().port)

  // ssl in production
  pg.defaults.ssl = server.address().port===9000 ? false : true;

  // alive message in prod
  if(!(server.address().port===9000)){
    setInterval(() => {
      request('https://mio-service.herokuapp.com/', (error, response, body) => {
        if(error) 
          console.log('alive error: ' + error);

        console.log('self-invoked alive: ' + body + ', status: ' + response.statusCode);
      })
    }, 1200000)
  }
})

