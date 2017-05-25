'use strict';

const express  = require('express'),
  bodyParser = require('body-parser'),
  service = express(),
  request = require('request'),
  pg = require('pg'),
  config = require('./config.js'),
  sliperiet = require('./data/sliperiet.json'),
  northern = require('./data/northern.json'),
  housebe = require('./data/housebe.json'),
  lounge = require('./data/lounge.json')

pg.defaults.ssl = true;

service.use(bodyParser.urlencoded({ extended: true }))
service.use(bodyParser.json())

service.use((req, res, next) => {
  console.log(req.method, req.url)
  next()
})

service.get('/', (req,res,next) => {
  return res.status(200).send('api available')
})


service.post('/search', (req,res,next) => {
  //different tasks depending on action
  let data = JSON.stringify(req.body)
  console.log('data:'+ data);

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

service.post('/interaction', (req,res,next) => {

  let response = {}
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



let contact = (context) => {
  //return object based on what context
  let res = {
    replace_original: false,
    text: ""
  }
  switch(context){
    case 'sliperiet_action':
      res.text = 'You can contact Sliperiet at <mailto:sliperiet@umu.se|sliperiet@umu.se> or <tel:+46907865000|090 786 50 00>'
      break
    case 'northern_action':
      res.text = 'You can contact The Great Northern at <mailto:phil@thegreatnorthern.org|phil@thegreatnorthern.org> or <tel:+46704339904|0704 33 99 04>'
      break
    case 'house_action':
      res.text = 'You can contact House Be at <mailto:andreas@andreaseriksson.se|andreas@andreaseriksson.se> or <tel:+46707448244|0707 44 82 44>'
      break
    case 'lounge_action':
      res.text = 'You can contact Business Lounge at <mailto:info@businesslounge.se|info@businesslounge.se> or <tel:+4687160025|087 16 00 25>'
      break
  }
  return res
}

let moreInfo = (context) => {
  //return object based on what context
  let res = {
    replace_original: false,
    text: ""
  }
  switch(context){
    case 'sliperiet_action':
      res.text = '*I found 6 companies and 48 persons in this region that could be of interest to your company profile. Description:*\nSliperiet is a creative hub, research and innovation centre, event facility, maker space and a part of Umeå University at Umeå Arts Campus. Get in touch with us to collaborate, use our facilities, book an event, or enquire about office space.'
      break
    case 'northern_action':
      res.text = '*I found 8 companies and 33 persons in this region that could be of interest to your company profile. Description:*\nThe Great Northern is a tech/cultural/creative melting pot in Skellefteå where design, technology and business blend to form a thriving startup community. It is an ambitious mix of co-working space, incubators, event arenas, startups and established businesses. We offer office space, fixed seats and flex seats.'
      break
    case 'house_action':
      res.text = '*I found 4 companies and 26 persons in this region that could be of interest to your company profile. Description:*\nAt House Be you can find conference rooms, work areas and social spaces suitable for both lectures, a relaxing sauna and the odd foosball tournament. House Be is the spot where like-minded entrepreneurs, creatives, developers and angel investors meet up, work and socialise. Built around a membership-model. House Be have an offering for both residential companies as well as businesses seeking a temporary solution.'
      break
    case 'lounge_action':
      res.text = '*I found 57 companies and 1254 persons in this region that could be of interest to your company profile. However, less is somtimes more. Description:*\nBusiness Lounge offer office facilities in Nacka for our network of small businesses, freelancers and branches, etc. In Nacka Strand we offer about 60 offices in landscape environments and twelve offices. In addition, there are plenty of meeting and conference rooms in different sizes. Our premises are bright and fresh, with an open, interactive and energetic office environment that will be inspiring and stimulating to most. We offer a place where you can grow and exchange experiences, etc. with others. Flexible and simple, dynamic and reliable. It is precisely the interactivity between the companies and individuals, where we have a high collective sense of togetherness and sense of shared drive, which makes a big difference to office space.'
      break
  }
  return res
}

let showNext = (context) => {
  //return object based on what context
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

