const pg = require('pg')

module.exports = {
  getUser: (user_slack_id) => {
    let user = null
    return new Promise((resolve, reject) => {
      pg.connect(process.env.DATABASE_URL, (err, client) => {
        if (err) throw err
        console.log('Connected to postgres! Getting schemas...')

        client
          .query("SELECT * FROM users WHERE user_slack_id='" + user_slack_id + "';")
          .on('row', (row) => {
            //console.log(JSON.stringify(row))
            resolve(row)
          })
      })
    })
  },
  addUser: (user_slack_id, user_name=null) => {
    pg.connect(process.env.DATABASE_URL, (err, client) => {
      if (err) throw err
      console.log('Connected to postgres! Getting schemas...')

      client
        .query("INSERT INTO users (user_slack_id, user_name, user_current_context, user_company_domain, user_company_type, user_company_location, user_company_size, user_office_prize) VALUES ('%s', 'joakim', 'sliperiet_action', 'design', 'agency', 'umeå', '3', '100');")
        .on('row', (row) => {
          console.log(JSON.stringify(row))
        })
    })
    return row
  },
  updateUser: () => {
    console.log('update user details');
  }
}