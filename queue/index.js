const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const axios = require('axios')

const app = express()
app.use(bodyParser.json())
app.use(cors())

const posts = {}

const handleEvent = (type, data) => {
  if (type === 'PostCreated') {
    const { id, title } = data;

    posts[id] = { id, title, comments: [] }
  } else if (type === 'CommentCreated') {
    const { id, content, postId, status } = data;

    posts[postId].comments.push({ id, content, status })
  } else if (type === 'CommentUpdated') {
    const { postId, status, id, content } = data

    const comment = posts[postId].comments.find(comment => {
      return comment.id === id
    })
    comment.status = status
    comment.content = content
  }
}

app.post('/events', (req, res) => {
  const { type, data } = req.body

  console.log('Received Event', type)

  handleEvent(type, data)

  res.status(200).send({})
})

app.get('/posts', (req, res) => {
  res.send(posts)
})

app.listen(4002, async () => {
  console.log('Listening on 4002')

  const res = await axios.get('http://localhost:4005/events')

  for (let event of res.data) {
    console.log ('Processing event:', event.type)

    handleEvent(event.data, event.type)
  }
})