'use strict';

const express  = require('express'),
  bodyParser = require('body-parser'),
  service = express();
  // config = require('./config.js');

service.use(bodyParser.urlencoded({ extended: true }));
service.use(bodyParser.json());

service.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});

service.get('/', (req,res,next) => {
  return res.status(200).send('Welcome, api available at /search');
});


service.post('/search', (req,res,next) => {

    // exBody = {
    //   company_profile: ''
    // };

    // get data
    // let data = req.body;
    // //location and company profile

    // request('https://maps.googleapis.com/maps/api/place/nearbysearch/output?'+"", (error, response, body) => {
    //     if (!error && response.statusCode == 200) {
    //         if(body==null || body == undefined || body == false){
    //             res.status(422).json([{"msg":"Nothing found","value":""}]);
    //             return;
    //         }
    //         else{
    //             return res.status(200).send(body);
    //         }
    //     }
    // });

    console.log('req params: '+ JSON.stringify(req.body.result.parameters));
    console.log('response: '+ JSON.stringify(res));
    var test = req.body.result && req.body.result.parameters && req.body.result.parameters.location ? req.body.result.parameters.location : "This is sample response"
    return res.json({
      speech: test,
      displayText: test,
      source: 'mio-service'
    });

});


//start Server
const server = service.listen((process.env.PORT || 9000), () => {

   console.log("Listening to port %s",server.address().port);

});
