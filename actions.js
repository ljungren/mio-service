//inport modules
const db = require('./db.js')
//import example data
const btnRes = require('./data/contact-and-info.js'),
  sliperiet = require('./data/sliperiet.json'),
  northern = require('./data/northern.json'),
  housebe = require('./data/housebe.json'),
  lounge = require('./data/lounge.json')

module.exports = {
  contact: (context) => {
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
  },
  moreInfo: (context) => {
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
  },
  showNext: (context) => {
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
  },
  identify: (user_slack_id) => {

    let ident = new Promise((resolve, reject) => {
      db.getUser(user_slack_id).then((user) => {
        console.log('user: '+JSON.stringify(user))

        //If user exist, respond with something

        //If not, respond with something else and then add user to db
        
        resolve(user===null ? null : user.user_name)

      }).then((user) => {
        //add user after response
      })
    })

    return ident

  },

}