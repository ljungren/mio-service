'use strict'

const pg = require('pg')

module.exports = {
  getUser: (user_slack_id) => {
    console.log('get user from db')
    return new Promise((resolve, reject) => {
      pg.connect(process.env.DATABASE_URL, (err, client) => {
        if (err) throw err
        console.log('Connected to postgres')

        // do select
        let str = "SELECT * FROM users WHERE user_slack_id='" + user_slack_id + "';"
        q(resolve, reject, err, client, str)

      })
    })
  },
  addUser: (user_slack_id, user_name) => {
    console.log('add user to db')
    return new Promise((resolve, reject) => {
      pg.connect(process.env.DATABASE_URL, (err, client) => {
        if (err) throw err
        console.log('Connected to postgres')

        // do insert
        let str = "INSERT INTO users (user_slack_id, user_name) VALUES ('"+user_slack_id+"', '"+user_name+"');"

        q(resolve, reject, err, client, str)

      })
    })
  },
  updateUser: (user_slack_id, user_name, user_current_context=null) => {
    console.log('update user details in db')
    return new Promise((resolve, reject) => {
      pg.connect(process.env.DATABASE_URL, (err, client) => {
        if (err) throw err
        console.log('Connected to postgres')

        // do insert
        let str = "UPDATE users SET user_name='"+user_name+"', user_current_context="+(user_current_context ? "'"+user_current_context+"'" : null)+" WHERE user_slack_id = '"+user_slack_id+"';"

        q(resolve, reject, err, client, str)

      })
    })
  },
  getPreference: () => {
    console.log('get user preferences from db')
  },
  updatePreference: (user_slack_id, user_company_domain, user_company_type=null, user_company_location=null, user_company_size=null, user_office_prize=null) => {
    console.log('update user preferences from db')
    return new Promise((resolve, reject) => {
      pg.connect(process.env.DATABASE_URL, (err, client) => {
        if (err) throw err
        console.log('Connected to postgres')

        // do insert
        let str = "UPDATE users SET user_company_domain = '"+user_company_domain+"', user_company_type='"+user_company_type+"', user_company_location='"+user_company_location+"', user_company_size='"+user_company_size+"', user_office_prize='"+user_office_prize+"' WHERE user_slack_id = '"+user_slack_id+"';"

        q(resolve, reject, err, client, str)

      })
    })
  }
}




let q = (resolve, reject, err, client, str) => {
  client.query(str)
    .on('error', (error) => {
      console.log('db: '+error)
    })
    .on('drain', () => {
      client.end.bind(client)
    })
    .on('row', (row) => {
      // console.log('Data: '+JSON.stringify(row))
      if(row===null || row===undefined || row===""){
        console.log('empty db response')
        resolve(null)
      }
      resolve(row)
    })
    .on('end', () => {
      console.log("db client was disconnected.")
      resolve(null)
    })
}