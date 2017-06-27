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
        res.json({speech: 'What do you think?', source: "slack"})

        if(action==='location_search'){
          //first search, give onboarding example
          giveContextExample(user_slack_id)
        }
      })
    }
    else{
      return response ? res.json({speech: response, source: "slack"}) : res.json({speech: "Sorry, something went wrong :angel: Feeling a bit dizzy... would you mind trying that again? \n", source: "slack"})
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
        comm.openDm(data.event.user.id)
        teamJoinRestoreMess(data).then((message)=>{
          comm.intentClassification(message).then((contexts)=> {
            if(contexts){
              if(contexts[1].length>0){
                console.log(JSON.stringify(response[1]))
                actions.updateSessionContexts(data.event.user.id, contexts[1]).then((ok)=>{
                  console.log('session contexts were updated in db')
                })
              }
            }
          })
        })
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
      actions.saveLatestMessage(data.event.user, data).then((ok)=>{
        console.log('Latest message saved')
      }).then(()=>{

        console.log('passing message to api.ai for intent classification')
        comm.intentClassification(data).then((response)=> {
          // console.log('intentClassification response: '+response[0])
          if(response){
            console.log('sending api.ai response to slack')
            //update current contexts
            if(response==='timeout'){
              comm.submitMessage('Sorry, I was in sleep mode...', data.event.channel).then((ok) => {
                typing(false, data.event.channel)
                getIntroMess(data.event.user.id).then((response) => {
                  comm.submitMessage(response, data.event.user.id)
                })
              })
            }
            else if(response[1].length>0){
              actions.updateSessionContexts(data.event.user, response[1]).then((ok)=>{
                console.log('session contexts were updated in db')
                //pass back response to slack
                comm.submitMessage(response[0], data.event.channel).then((ok) => {
                  typing(false, data.event.channel)
                })
              })
            }
          }
        })
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


/*
************************************************************************
************************************************************************
************************************************************************
Refactor what's below to separate module at some point... also separate webhook from slack API endpoint
************************************************************************
************************************************************************
************************************************************************
*/

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
      return new Promise((resolve, reject) => {
        getIntroMess(slack_id).then((intr)=>{
          intr.charAt(0)==='H' ? doIntroAddOn(slack_id) : console.log('\n');
          resolve(intr)
        })
      })
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
        resolve("_Here I will tell you practical details about the current office context_")
      })
      break
    case 'search_again':
      console.log('searched office again')
      return getOfficeMess(slack_id, "Hang on! I'll check...", "What do you think? :slightly_smiling_face:")
      break
    case 'main_fallback':
      console.log('main fallback triggered')
      return actions.fallbackMess(slack_id)
      break
    default:
      console.log('no specific action on fulfillment req, responding with fallback')
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
      })
    })
  })
}

// on event of user becomes present and don't have current context
let doIntroAddOn = (slack_id) => {
  typing(true)
  delay(4000).then(() => {
    comm.submitMessage("--------\n\nIt's not as complicated as it sounds, promise :wink:", slack_id)
    delay(2000).then(() => {
      comm.submitMessage('--------\n\nI am just a prototype, and the purpose is to evaluate this type of interface, not to give real results. However, I can learn about your company and consider your thoughts about my suggestions, so please comment on my results so that I can serve your needs.\n\n*You can start by briefly explaining to me what it is your company does.* ', slack_id)
      typing(false)
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
        comm.submitMessage("_Unfourtunately, I don't have more example locations. But please pretend that I keep giving you new adapted suggestions, even though I don't_ :angel:", id).then(() => {
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

let giveContextExample = (slack_id) => {
  delay(3000).then(() => {
    comm.submitMessage("_You can for example ask about why and how this office is a good option, who works there, price etc. Or tell me how you would like it to be different._", slack_id)
  })
}

let delay = (duration) => {
  return new Promise((resolve, reject)=>{
    setTimeout(() => {
      resolve('ok')
    }, duration)
  })
}

let teamJoinRestoreMess = (data) => {
  let m = {
    token:data.token,
    team_id:data.team_id,
    api_app_id:data.api_app_id,
    event:{
      type:"message",
      user:data.event.user.id,
      text:"hello"
    },
    type:data.type,
    authed_users:data.authed_users,
    event_id:data.event_id,
    event_time:data.event_time
  }

  return new Promise((resolve, reject)=>{
    resolve(m)
  })
}