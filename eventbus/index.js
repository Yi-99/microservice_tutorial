const express = require('express')
const bodyParser = require('body-parser')
const axios = require('axios')
const cors = require('cors')

const app = express()
app.use(bodyParser.json())
app.use(cors())

const events = []

app.post('/events', async (req, res) => {
  const event = req.body

  events.push(event)

  const services = [
    'http://localhost:4000/events', // posts
    'http://localhost:4001/events', // comments
    'http://localhost:4002/events', // queue
    'http://localhost:4003/events', // moderation
  ]

  for (const serviceUrl of services) {
    try {
      await axios.post(serviceUrl, event)
    } catch (err) {
      console.error(`Error sending event to service: ${serviceUrl}:`, err)
    }
  }

  res.send({ status: 'OK' })
})

app.get('/events', (req, res) => {
  res.send(events)
})

app.listen(4005, () => {
  console.log("Listening on 4005!")
})