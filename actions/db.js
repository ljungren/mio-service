'use strict'

const pg = require('pg')

module.exports = {
  getUser: (user_slack_id) => {
    console.log('get user from db')
    return new Promise((resolve, reject) => {
      pg.connect(process.env.DATABASE_URL, (err, client) => {
        if (err){
          console.log('err: '+err)
        }
        console.log('Connected to postgres')

        // do select
        let str = "SELECT * FROM users WHERE user_slack_id='" + user_slack_id + "';"
        q(resolve, reject, err, client, str, pg)

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

        q(resolve, reject, err, client, str, pg)

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

        q(resolve, reject, err, client, str, pg)

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
        console.log('Connected to db client')

        // do insert
        let str = "UPDATE users SET user_company_domain = '"+user_company_domain+"', user_company_type='"+user_company_type+"', user_company_location='"+user_company_location+"', user_company_size='"+user_company_size+"', user_office_prize='"+user_office_prize+"' WHERE user_slack_id = '"+user_slack_id+"';"

        q(resolve, reject, err, client, str, pg)

      })
    })
  },
  updateUserSession: (user_slack_id, user_session_contexts) => {
    console.log('update user session contexts in db')
    return new Promise((resolve, reject) => {
      pg.connect(process.env.DATABASE_URL, (err, client) => {
        if (err) throw err
        console.log('Connected to postgres')

        // console.log(JSON.stringify(user_session_contexts))
        // do insert
        let str = "UPDATE users SET user_session_contexts='"+JSON.stringify(user_session_contexts)+"' WHERE user_slack_id = '"+user_slack_id+"';"

        q(resolve, reject, err, client, str, pg)

      })
    })
  },
  updateLatestMessage: (user_slack_id, user_latest_message) => {
    console.log('update user latest message in db')
    return new Promise((resolve, reject) => {
      pg.connect(process.env.DATABASE_URL, (err, client) => {
        if (err) throw err
        console.log('Connected to postgres')

        // console.log(JSON.stringify(user_latest_message))
        // do insert
        let str = "UPDATE users SET user_latest_message='"+JSON.stringify(user_latest_message)+"' WHERE user_slack_id = '"+user_slack_id+"';"

        q(resolve, reject, err, client, str, pg)

      })
    })
  }
}




let q = (resolve, reject, err, client, str, pg) => {
  client.query(str)
    .on('error', (error) => {
      console.log('db: '+error)
      client.end()
      pg.end()
    })
    .on('drain', () => {
      console.log('queries executed')
      client.end()
      pg.end()
    })
    .on('row', (row) => {
      // console.log('Data: '+JSON.stringify(row))
      if(row===null || row===undefined || row===""){
        console.log('empty db response')
        resolve(null)
      }
      else{
        console.log('responding with db data')
        resolve(row)
      }
      client.end()
      pg.end()
    })
    .on('end', () => {
      console.log("db client was disconnected.")
      resolve(null)
      client.end()
      pg.end()
    })
}