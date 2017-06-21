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
  db = require('./actions/db.js'),
  actions = require('./actions/actions.js'),
  comm = require('./comm.js')

// configure env
require('dotenv').config()
// create app
const service = express()
//declare RTM api
let rtm
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
  else if(data.event.user===process.env.BOT_ID){
    console.log('ignoring bot message')
    return res.status(202).send('Ignoring bot message')
  }
  else if('token' in data && data.token===process.env.EVENT_TOKEN){
    //event call is ok
    res.status(200).send()
    handleEvent(data)
  }
  else if(!('token' in data || data.token===process.env.EVENT_TOKEN)){
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

  getResponse(action, null, user_slack_id).then((response) => {
    if(response.hasOwnProperty('attachments')){
      //send rich message directly to slack client
      console.log('sending office suggestion')
      comm.submitRichMessage(response, data.originalRequest.data.event.channel).then((ok) => {
        //return fulfillment response to api.ai
        return res.json({speech: 'What do you think?', source: "slack"})
      })
    }
    else{
      return response ? res.json({speech: response, source: "slack"}) : res.json({speech: "Sorry, I cannot reply to this yet :angel: \n", source: "slack"})
    }
  })
})


// INVOKES FROM SLACK INTERACTIVE BUTTONS
service.post('/interaction', (req,res,next) => {
  // console.log('payload:'+ JSON.stringify(req.body.payload))
  let data = JSON.parse(req.body.payload)
  // let data = req.body.payload
  let action = data.actions[0].value
  let context = data.callback_id
  let id = data.user.id
  console.log('button interaction: '+ context + ': ' + action)

  getResponse(action, context, id).then((response)=>{
    response['as_user'] = true
    return res.status(200).send(response)
  })
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
  rtm = new RtmClient(process.env.BOT_TOKEN)
  rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, () => {
    console.log('RTM connection opened')
  })
  rtm.start()
})

// Functions
let handleEvent = (data) => {
    typing(true, data.event.channel)    
    console.log('post from slack, event type: '+data.event.type)
    // console.log('data: '+JSON.stringify(data))
    if(data.event.type==='team_join'){
      console.log('a new user has joined')
      getIntroMess(data.event.user.id).then((response) => {
        comm.submitMessage(response, data.event.user.id)
      }).then(()=>{
        comm.openDm(data.event.user.id)
      })
    }
    else if(data.event.type==='im_open'){
      console.log('a DM channel was opened')
      // getIntroMess(data.event.user).then((response) => {
      //   comm.submitMessage(response, data.event.channel)
      // })
    }
    else if(data.event.type==='message'){
      //send message as req to to api.ai for intent classification.
      console.log('passing message to api.ai for intent classification')
      comm.intentClassification(data).then((response)=> {
        // console.log('intentClassification response: '+response)
        if(!(response===null || response===undefined)){
          console.log('sending api.ai response to slack')
          comm.submitMessage(response, data.event.channel).then((ok) => {
            typing(false, data.event.channel)
          })
        }
      })
    }
}

let typing = (typing, channel) => {
  if(typing){
    console.log('start typing')
    rtm.connected ? rtm.sendTyping(channel) : Promise.resolve(rtm.reconnect()).then(()=>{
      rtm.sendTyping(channel)
    })
  }
  else{
    console.log('stop typing')
    rtm.connected ? Promise.resolve(rtm.sendMessage('', channel)).catch(e => console.log('empty rtm mess ok')) : rtm.reconnect()
  }
}

//get response or action based on classified intents
let getResponse = (action, context, slack_id=null) => {
    switch(action){
    case 'contact':
      console.log('contact info requested')
      return new Promise((resolve, reject) => {
        resolve(actions.contact(context))
      })
      break
    case 'more':
      console.log('more info requested')
      return new Promise((resolve, reject) => {
        resolve(actions.moreInfo(context))
      })
      break
    case 'next':
      console.log('new search requested')
      return getOfficeMess(slack_id, 'One sec...', 'How do you like it? :+1:')
      break
    case 'contact_text':
      console.log('contact info requested')
      return getContactMess(slack_id)
      break
    case 'smalltalk.greetings.hello':
      console.log('user said hello')      
      return getIntroMess(slack_id)
      break
    case 'office_find':
      //user searched for office
      console.log('user wants to find office')
      return getContextMess(slack_id)
      break
    case 'location_search':
      //user searched for office
      console.log('searched location')
      return getOfficeMess(slack_id, 'Got it! checking...', 'If you like it, you should contact them for getting more detailed information. Or is it something that you would prefer different?')
      break
    case 'relevance_ask':
      console.log('relevance was asked')
      return new Promise((resolve, reject) => {
        //respond with context aware information
        resolve("_Here I will give information about the relevant people, companies and community etc for the current office context_")
      })
      break
    case 'practical_ask':
      console.log('relevance was asked')
      return new Promise((resolve, reject) => {
        //respond with specific location, rent and space
        resolve("_Here I will tell you practical details_")
      })
      break
    case 'search_again':
      console.log('searched office again')
      return getOfficeMess(slack_id, "Hang on! I'll check...", "What do you think? :slightly_smiling_face:")
      break
    default:
      console.log('no specific action, responding with fallback')
      return new Promise((resolve, reject) => {
        resolve("Sorry, I don't understand quite understand :confused:")
      })
  }
}

let getIntroMess = (slack_id) => {
  return new Promise((resolve, reject)=>{
    actions.identify(slack_id).then((user)=>{
      actions.introMess(user).then((response) => {
        resolve(response)
        if(response.charAt(0)==='H'){
          // get if user is prescent
          doIntroAddOn(slack_id)
        }
      })
    })
  })
}

// on event of user becomes prescent and don't have current context
let doIntroAddOn = (slack_id) => {
  delay(10000).then(() => {
    comm.submitMessage("--------\n\nIt's not as complicated as it sounds, promise :wink:", slack_id)
  }).then(() => {
    delay(2000).then(() => {
      comm.submitMessage('--------\n\nI am just a prototype, and the purpose is to evaluate this type of interface, not to give real results. However, I can learn about your company and consider your thoughts about my suggestions, so please comment on my results so that I can serve your needs.\n\n*You can start by briefly explaining to me what it is your company does.* ', slack_id)
    })
  })
}

let getContextMess = (slack_id) => {
  return new Promise((resolve, reject)=>{
    actions.contextMess(slack_id).then((response)=>{
      resolve(response)
    })
  })
}

let getOfficeMess = (id, str1, str2) => {
  return new Promise((resolve, reject) => {
    comm.submitMessage(str1, id)
    actions.getContext(id).then((prevContext) => {
      let newObject = actions.showNext(prevContext)
      let newContext = newObject.attachments[0].callback_id
      if(prevContext==='lounge_action'){
        comm.submitMessage("Unfourtunately, I don't have more example locations. But please pretend that I keep giving you new adapted suggestions, even though I don't :angel:", id).then(() => {
          resolve(newObject)
        })
      }
      else{
        resolve(newObject)
      }
      
      actions.updateContext(id, newContext)
      // delay(10000).then(() => {
      //   comm.submitMessage(str2, id)
      // })
      // .then(()=>{
      //   delay(10000).then(() => {
      //     comm.submitMessage('', id)
      //   })
      // })
    })
  })
}

let getContactMess = (id) => {
  return new Promise((resolve, reject) => {
    actions.getContext(id).then((currentContext) => {
      resolve(actions.contact(currentContext).text)
    })
  })
}

let delay = (duration) => {
  return new Promise((resolve, reject)=>{
    setTimeout(() => {
      resolve('ok')
    }, duration)
  })
}


