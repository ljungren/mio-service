'use strict';

const express  = require('express'),
  bodyParser = require('body-parser'),
  service = express(),
  request = require('request'),
  config = require('./config.js'),
  attachments = require('./attachments.json')


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

  //pass parameters? delayed slack response possible

  let temp = {
    speech: "Thanks for the info! I'll get back to you with what I find in a sec.",
    displayText: "Thanks for the info! I'll get back to you with what I find in a sec.",
    source: "mio-service",
  }
  //res.write(JSON.stringify(temp))
  //res.write(attachments)
  // return res.end()
  
  return res.status(200).send(attachments)

})

service.post('/info', (req,res,next) => {
  //respond with info about requested location/office (sliperiet, house be?)
  res.send('poop')
})
//start Server
const server = service.listen((process.env.PORT || 9000), () => {

   console.log("Listening to port %s",server.address().port)

})

