'use strict'

//import modules
const express  = require('express'),
  bodyParser = require('body-parser'),
  helmet = require('helmet'),
  request = require('request'),
  RtmClient = require('@slack/client').RtmClient,
  CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS,
  // apiai = require('apiai'),
  pg = require('pg'),
  actions = require('./actions/actions.js'),
  comm = require('./comm.js'),
  config = require('./config.js')

// app
const service = express()

//RTM
const rtm = new RtmClient(config.slack.bot_token)

//middleware
service.use(bodyParser.urlencoded({ extended: true }))
service.use(bodyParser.json())
service.use(helmet())
service.use((req, res, next) => {
  console.log(req.method, req.url)
  next()
})

//routes
service.get('/', (req,res,next) => {
  return res.status(200).send('api available')
})

//INVOKES FROM SLACK EVENT
service.post('/message', (req,res,next) => {
  // console.log('data:'+ JSON.stringify(req.body))
  let data = req.body

  // identify request origin
  if('challenge' in data){
    console.log('slack authentication')
    return res.status(200).send(data.challenge)
  }
  else if(data.event.user===config.slack.bot_id){
    console.log('ignoring bot message')
    return res.status(202).send('Ignoring bot message')
  }
  else if('token' in data && data.token===config.slack.event_token){
    //event call is ok
    res.status(200).send()
    handleEvent(data)
  }
  else if(!('token' in data || data.token===config.slack.event_token)){
    return res.status(401).send('Unauthorized request')
  }
  else{
    return res.status(400).send('Bad request')
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
      return response ? res.json({speech: response, source: "slack"}) : res.json({speech: "Sorry, I cannot reply to this yet :angel: \n", source: "slack"})
    })
  }
  else{
    //if not promise, it's a rich message. Send directly to slack client
    console.log('sending office suggestion')
    comm.submitRichMessage(obj, data.originalRequest.data.event.channel).then((ok) => {
      //return fulfillment response to api.ai
      return res.json({speech: 'what do you think?', source: "slack"})
    })
  }

})


// INVOKES FROM SLACK INTERACTIVE BUTTONS
service.post('/interaction', (req,res,next) => {

  // console.log('payload:'+ JSON.stringify(req.body.payload))
  let data = JSON.parse(req.body.payload)

  let action = data.actions[0].value
  let context = data.callback_id
  console.log('button interaction: '+ context + ': ' + action)

  let response = getResponse(action, context)
  return res.status(200).send(response)
})


//start Server
const server = service.listen((process.env.PORT || 9000), () => {

  console.log("Listening to port %s",server.address().port)

  // ssl in production
  pg.defaults.ssl = server.address().port===9000 ? false : true

  // alive message in prod
  if(!(server.address().port===9000)){
    setInterval(() => {
      request('https://mio-service.herokuapp.com/', (error, response, body) => {
        if(error) 
          console.log('alive error: ' + error)

        console.log('self-invoked ALIVE: ' + body + ', status: ' + response.statusCode)
      })
    }, 1200000)
  }
  //RTM
  rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, () => {
    console.log('RTM connection opened')
  })
  rtm.start()
})



// Functions
let handleEvent = (data) => {
    typing(true, data)    
    console.log('post from slack, event type: '+data.event.type)
    // console.log('data: '+JSON.stringify(data))
    if(data.event.type==='team_join'){
      console.log('a new user has joined')
      getIntro(data.event.user.id).then((response) => {
        comm.submitMessage(response, data.event.user.id)
      }).then(()=>{
        comm.openDm(data.event.user.id)
      })
    }
    else if(data.event.type==='im_open'){
      console.log('a DM channel was opened')
      getIntro(data.event.user).then((response) => {
        comm.submitMessage(response, data.event.channel)
      })
    }
    else if(data.event.type==='message'){
      //send message as req to to api.ai for intent classification.
      console.log('passing message to api.ai for intent classification')
      comm.intentClassification(data).then((response)=> {
        // console.log('intentClassification response: '+response)
        if(!(response===null || response===undefined)){
          console.log('sending api.ai response to slack')
          comm.submitMessage(response, data.event.channel).then((ok) => {
            typing(false, data)
          })
        }
      })
    }
}


let typing = (typing, data) => {
  if(typing){
    console.log('start typing')
    rtm.connected ? rtm.sendTyping(data.event.channel) : Promise.resolve(rtm.reconnect()).then(()=>{
      rtm.sendTyping(data.event.channel)
    })
  }
  else{
    console.log('stop typing')
    rtm.connected ? Promise.resolve(rtm.sendMessage('', data.event.channel)).catch(e => console.log('empty rtm mess ok')) : rtm.reconnect()
  }
}

//get response or action based on classified intents
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
      let newObj = actions.showNext(context)
      let newContxt = newObj.attachments[0].callback_id
      console.log('newContxt: '+ newContxt);
      actions.updateContext(param1, newContxt)
      return newObj
      break
    case 'smalltalk.greetings.hello':
      console.log('user said hello')      
      return getIntro(param1)
      break
    case 'office_find':
      //user searched for office
      console.log('user wants to find office')
      return getContext(param1)
      break
    case 'location_search':
      //user searched for office
      console.log('searched location')
      let newObject = actions.showNext(context)
      let newContext = newObject.attachments[0].callback_id
      console.log('newContxt: '+ newContext);
      actions.updateContext(param1, newContext)
      return newObject
      break
    case 'relevance_ask':
      console.log('relevance was asked')
      break
    default:
      console.log('no specific action, responding with fallback')
      return new Promise((resolve, reject) => {
        resolve("Sorry, I don't understand quite understand :confused:")
      })
  }
}

let getIntro = (slack_id) => {
  return new Promise((resolve, reject)=>{
    actions.identify(slack_id).then((user)=>{
      actions.intro(user).then((response) => {
        resolve(response)
      })
    })
  })
}

let getContext = (slack_id) => {
  return new Promise((resolve, reject)=>{
    actions.context(slack_id).then((response)=>{
      resolve(response)
    })
  })
}


