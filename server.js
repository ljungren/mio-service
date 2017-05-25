'use strict';

//import modules
const express  = require('express'),
  bodyParser = require('body-parser'),
  service = express(),
  request = require('request'),
  config = require('./config.js'),
  db = require('./db.js')


//import example data
const btnRes = require('./data/contact-and-info.js'),
  sliperiet = require('./data/sliperiet.json'),
  northern = require('./data/northern.json'),
  housebe = require('./data/housebe.json'),
  lounge = require('./data/lounge.json')

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


// INVOKE WITH: test: dinosaur prod: api.ai webhook
service.post('/search', (req,res,next) => {
  
  // (print request) console.log('data:'+ JSON.stringify(req.body));
  let data = req.body
  let action = data.result.action
  let user_slack_id = data.originalRequest.data.event.user

  let response = null
  //different tasks depending on action
  switch(action){
    case 'identify_user':
      //new user?
      let identify = new Promise(() => {
        return db.getUser(user_slack_id)
      })
      identify.then((user) => {
        console.log('user: '+user)
        response = user===null ? null : user.user_name
        // doResponse(response)
        // if(response){
        //   return res.json({speech: "Hey " + response + " \n", source: "mio-service"})  
        // }
        // return res.json({speech: "I cannot reply to this yet. It's really just dummy data :angel: \n", source: "mio-service"})
      })
      
      break
    case 'location_search':
      //user searched for office
      console.log('searched again via text');
      //doResponse with current context and action:next
      break
    case 'relevance_ask':
      break
    default:
      console.log('no action matched');
  }
  console.log(response);

  return res.json({speech: "I cannot reply to this yet. It's really just dummy data :angel: \n", source: "mio-service"})
})

// INVOKE WITH: message buttons
service.post('/interaction', (req,res,next) => {

  // (print request) console.log('payload:'+ JSON.stringify(req.body.payload));
  // parse string to JSON
  let data = JSON.parse(req.body.payload)

  let action = data.actions[0].value
  let context = data.callback_id
  console.log(context + ': ' + action)

  let response = null
  response = doResponse(context, action)  

  // response.prototype.speech = 'What do you think?'
  return res.status(200).send(response)
})

let doResponse = (context, action, param = null) => {
    switch(action){
    case 'contact':
      console.log('contact info requested')
      return contact(context)
      break
    case 'more':
      console.log('more info requested')
      return moreInfo(context)
      break
    case 'next':
      console.log('new search requested')
      return showNext(context)
      break
    case '':
      console.log('user identified')
      return showNext(context)
      break
    default:
      console.log('no action value found')
  }
  return null
}

//functions

let contact = (context) => {
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
}

let moreInfo = (context) => {
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
}

let showNext = (context) => {
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
}



//start Server
const server = service.listen((process.env.PORT || 9000), () => {

  console.log("Listening to port %s",server.address().port)

  setInterval(() => {
    request('https://mio-service.herokuapp.com/', function (error, response, body) {
      console.log('alive_error: ' + error);
      console.log('alive_status_code: ' + response && response.statusCode);
      console.log('alive_message: ' + body);
    })
  }, 1200000)

})

