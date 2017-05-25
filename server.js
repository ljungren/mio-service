'use strict';

//import modules
const express  = require('express'),
  bodyParser = require('body-parser'),
  service = express(),
  request = require('request'),
  pg = require('pg'),
  config = require('./config.js')

//import data
const btnRes = require('./data/contact-and-info.js'),
  sliperiet = require('./data/sliperiet.json'),
  northern = require('./data/northern.json'),
  housebe = require('./data/housebe.json'),
  lounge = require('./data/lounge.json')

pg.defaults.ssl = true;

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
  //different tasks depending on action
  // (print request) 
  console.log('data:'+ JSON.stringify(req.body));
  let data = req.body
  //JSON.parse(req.body.payload)
  let action = data.result.action

  console.log('req.body: '+req.body);

  // pg.connect(process.env.DATABASE_URL, function(err, client) {
  //   if (err) throw err;
  //   console.log('Connected to postgres! Getting schemas...');

  //   client
  //     .query('SELECT user_id FROM users;')
  //     .on('row', function(row) {
  //       console.log(JSON.stringify(row));
  //     });
  // });
  return res.json({
    speech: "I cannot reply to this yet. It's really just dummy data :angel: \n",
    source: "mio-service" 
  })
})

// INVOKE WITH: message buttons
service.post('/interaction', (req,res,next) => {

  let response = {}
  // (print request) console.log('payload:'+ JSON.stringify(req.body.payload));
  let data = JSON.parse(req.body.payload)

  let action = data.actions[0].value
  let context = data.callback_id
  console.log(context + ': ' + action)

  switch(action){
    case 'contact':
      console.log('contact info requested')
      response = contact(context)
      break
    case 'more':
      console.log('more info requested')
      response = moreInfo(context)
      break
    case 'next':
      console.log('new search requested')
      response = showNext(context)
      break
    default:
      console.log('no value found')
  }

  return res.status(200).send(response)
})


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

