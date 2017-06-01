'use strict';

//import modules
const express  = require('express'),
  bodyParser = require('body-parser'),
  service = express(),
  request = require('request'),
  apiai = require('apiai'),
  pg = require('pg'),
  actions = require('./actions/actions.js'),
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


// INVOKE WITH: api.ai webhook (test: "dinosaur")
service.post('/message', (req,res,next) => {

  console.log('data:'+ req.body);
  let data = req.body

  // identify request origin getOrigin()
  if('challenge' in data){
    console.log('slack authentication')
    return res.status(200).send(req.body.challenge)
  }
  else if('token' in data && data.token===config.slack_event_token){
    console.log('post from slack, event type: '+data.event.type)
    //extract events and do something

    //send req to to api.ai for intent classification.
    submitMessage(data).then((response)=> {
      return res.status('200').send(response)
    })
  }
  // else if('originalRequest' in data){
  else{
    console.log('webhook request from api.ai');
    // do getResponse like usual, but respond to slack instead of through api.ai
    //get params
    let action = data.result.action
    let user_slack_id = data.originalRequest.data.event.user

    getResponse(action, null, user_slack_id).then((response) => {
      return response ? res.json({speech: response, source: "mio-service"}) : res.json({speech: "Sorry, I cannot reply to this yet :angel: \n", source: "mio-service"})
      // return response ? res.status(200).send(response) : res.status(200).send("Sorry, either you ar an invalid user or I cannot reply to this yet :angel: \n")
    })
  }
  // else{
  //   console.log('request came from api.ai??');
  // }
})


let submitMessage = (data) => {
  return new Promise((resolve, reject) => {
 
    let ai = apiai("33e3ab5ee3c546ec9e071305797b4b60");
     
    let aireq = ai.textRequest(data.text, {
        sessionId: 'ea5f7a06-8910-4b67-b83b-8eb8de7db11f'
    });
     
    aireq.on('response', (response) => {
        console.log(response);
        resolve(response)
    });
     
    aireq.on('error', (error) => {
        console.log('ERROR: '+error);
    });
     
    aireq.end();
  })
}


// INVOKE WITH: message buttons
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

  //set up alive messaging
  setInterval(() => {
    request('https://mio-service.herokuapp.com/', (error, response, body) => {
      if(error) 
        console.log('alive error: ' + error);

      console.log('self-invoked alive: ' + body + ', status: ' + response.statusCode);
    })
  }, 1200000)
})

