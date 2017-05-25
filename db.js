const pg = require('pg')

pg.defaults.ssl = false;

module.exports = {
  getUser: (user_slack_id) => {
    let user = null
    pg.connect(process.env.DATABASE_URL, (err, client) => {
      if (err) throw err
      console.log('Connected to postgres! Getting schemas...')

      client
        .query("SELECT * FROM users WHERE user_slack_id='" + user_slack_id + "';")
        .on('row', (row) => {
          console.log(JSON.stringify(row))
          user = row
        })
    })
    return user
  }

}