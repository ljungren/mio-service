'use strict';

const express  = require('express'),
    path     = require('path'),
    bodyParser = require('body-parser'),
    service = express(),
    config = require('./config.js');

service.use(bodyParser.urlencoded({ extended: true }));
service.use(bodyParser.json());

service.use((req, res, next) => {
    console.log(req.method, req.url);
    next();
});


service.post('search', (req,res,next) => {

    var test = req.body.result && req.body.result.parameters && req.body.result.parameters.echoText ? req.body.result.parameters.echoText : "Seems like some problem. Speak again."
    return res.json({
        speech: test,
        displayText: test,
        source: 'mio-service'
    });

    //get data
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

});


//start Server
const server = service.listen(9000,function(){

   console.log("Listening to port %s",server.address().port);

});
