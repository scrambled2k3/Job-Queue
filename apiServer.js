const kue = require('kue');
const express = require('express')
const bodyParser = require('body-parser')
const http = require('http')
const sqlite3 = require('sqlite3')
const db = new sqlite3.Database('Sites')
const app = express()
require('dotenv').config()

// connect to redis
let queue = kue.createQueue({
  redis: {
    host: process.env.REDIS_SERVER_IP,
    port: process.env.REDIS_SERVER_PORT
  }
});

// automatically parse body content in request to json
app.use(bodyParser.json())

// posting to the root endpoint with a 'url' property in the body will return a job_id
app.post('/', function(req, res, next) {
  let url = req.body.url

  // return error if no url was passed
  if (!url) {
    res.status(417).json({ error: 'url must be present' })
    return
  }

  // insert the site into the database, and return an ID the user can use to request the data with later
  let statement = db.prepare('INSERT INTO sites(url) VALUES(?)')
  let job_id = null

  statement.run(url, function(error) {
    job_id = this.lastID

    // add this job to the queue
    const pageScraper = queue.create('pageToScrape', {
      url: url,
      site_id: job_id
    })
      .removeOnComplete(true)
      .attempts(5)
      .backoff({ delay: 60 * 1000, type: 'exponential' })
      .save()

    pageScraper.on('failed', function(errorMessage) {
      let error = JSON.parse(errorMessage)
      console.log(error)
    })

    res.json({ job_id })
  })
  statement.finalize()
})

// pass a 'job_id' as a query string parameter to retrieve the site payload
app.get('/', (req, res) => {

  //return an error if no job_id was given
  if (!req.query.job_id) {
    res.status(417).json({ error: 'job_id must be present' })
    return
  }

  // get the information from the database and return it
  let statement = 'SELECT * FROM sites WHERE id = ?'

  db.get(statement, [req.query.job_id], (err, row) => {
    res.json({ url: row.url, content: row.content });
  });
})

// server listener
var server = http.createServer(app).listen(process.env.API_SERVER_PORT, function() {
  console.log('Server listening on port ' + process.env.API_SERVER_PORT)
})