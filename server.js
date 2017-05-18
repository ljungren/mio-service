'use strict';

const express  = require('express'),
  bodyParser = require('body-parser'),
  service = express(),
  config = require('./config.js'),
  attachments = require('./attachments.json');


service.use(bodyParser.urlencoded({ extended: true }));
service.use(bodyParser.json());

service.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});

service.get('/', (req,res,next) => {
  return res.status(200).send('api available at /search');
});


service.post('/search', (req,res,next) => {

  //example data
  let result = {
    "source": "agent",
    "resolvedQuery": "we are a design agency",
    "action": "maps.search",
    "actionIncomplete": false,
    "parameters": {
      "company-domain": "design",
      "company-type": "agency"
    }
  }
  //console.log('example data: ' + result.parameters);
  //console.log('request data: ' + req.body.result.parameters);

  // setTimeout(() => {
    return res.json({
      speech: 'This is a sample response',
      displayText: 'This is a sample response',
      source: 'mio-service',
    });
    // return res.status(200).send(attachments);
  // }, 5000);
  // console.log('response: '+attachments);
  // return res.status(200).send(attachments);

});

service.post('/info', (req,res,next) => {
  //respond with info about requested location/office (sliperiet, house be?)

});
//start Server
const server = service.listen((process.env.PORT || 9000), () => {

   console.log("Listening to port %s",server.address().port);

});
