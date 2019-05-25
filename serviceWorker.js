const kue = require('kue');
const request = require('request');
const sqlite3 = require('sqlite3')
const db = new sqlite3.Database('Sites')
require('dotenv').config()

let queue = kue.createQueue({
  redis: {
    host: process.env.REDIS_SERVER_IP,
    port: process.env.REDIS_SERVER_PORT
  }
});

// collect the page HTML when it enters the queue
queue.process('pageToScrape', 5, (job, done) => {

  // get html content and update the database
  request({uri: job.data.url},
    function(error, response, body) {
      let statement = db.prepare('UPDATE sites SET content = ? where id = ?')
      statement.run(body, job.data.site_id)
    });

  done();
});