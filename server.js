'use strict';

const express  = require('express'),
  bodyParser = require('body-parser'),
  service = express(),
  request = require('request'),
  config = require('./config.js'),
  sliperiet = require('./sliperiet.json'),
  northern = require('./northern.json')



service.use(bodyParser.urlencoded({ extended: true }))
service.use(bodyParser.json())

service.use((req, res, next) => {
  console.log(req.method, req.url)
  next()
})

service.get('/', (req,res,next) => {
  return res.status(200).send('api available at /search and /info')
})


service.post('/search', (req,res,next) => {
  //needs data: slack: {}
  return res.status(200).send(sliperiet)
})

service.post('/info', (req,res,next) => {
  //respond with info about requested location/office (sliperiet, house be?)
  let response = {}
  // console.log('action value: ' + JSON.stringify(req.body))

  // switch(req.body.actions[0].value){
  //   case 'web':
  //     console.log('link clicked');
  //     break;
  //   case 'more':
  //     console.log('more info requested')
  //     break;
  //   case 'next':
  //     response = showNextResult(req.body)
  //     break;
  //   case 'previous':
  //     response = showPreviousResult(req.body)
  //     break;
  //   default:
  //     response = showNextResult(req.body)
  // }
  
  // return res.status(200).send(response)
  return res.status(200).send(northern)
})

//start Server
const server = service.listen((process.env.PORT || 9000), () => {

   console.log("Listening to port %s",server.address().port)

})

let showNext = (body, context) => {
  return northern
  //another switch case deciding what button that was pressed and decides the response
}

