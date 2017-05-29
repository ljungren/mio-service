const pg = require('pg')

module.exports = {
  getUser: (user_slack_id) => {
    return new Promise((resolve, reject) => {
      pg.connect(process.env.DATABASE_URL, (err, client) => {
        if (err) throw err
        console.log('Connected to postgres! Getting schemas...')

        // do select
        let str = "SELECT * FROM users WHERE user_slack_id='" + user_slack_id + "';"
        q(resolve, reject, err, client, str)

      })
    })
  },
  addUser: (user_slack_id, user_name) => {
    return new Promise((resolve, reject) => {
      pg.connect(process.env.DATABASE_URL, (err, client) => {
        if (err) throw err
        console.log('Connected to postgres! Getting schemas...')

        // do insert
        let str = "INSERT INTO users (user_slack_id, user_name) VALUES ('"+user_slack_id+"', '"+user_name+"');"
        q(resolve, reject, err, client, str)

      })
    })
  },
  updateUser: () => {
    console.log('update user details');
  }
}




let q = (resolve, reject, err, client, str) => {
  client.query(str)
    .on('error', (error) => {
      console.log(error);
    })
    .on('drain', () => {
      client.end.bind(client)
    })
    .on('row', (row) => {
      console.log(JSON.stringify(row))
      if(row===null || row===undefined){
        console.log('no result');
      }
      resolve(row)
    })
    .on('end', () => {
      console.log("Client was disconnected.")
      resolve(null)
    })
}