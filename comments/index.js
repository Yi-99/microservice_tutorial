const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const axios = require('axios')

const app = express()
app.use(bodyParser.json())
app.use(cors())

const commentsByPostId = {}

app.get('/posts/:id/comments', (req, res) => {
  return res.send(commentsByPostId[req.params.id] || [])
})

app.post('/posts/:id/comments', async (req, res) => {
  const commentId = uuidv4()
  const { content } = req.body
  
  const comments = commentsByPostId[req.params.id] || []
  comments.push({ id: commentId, content, status: 'pending' });
  commentsByPostId[req.params.id] = comments

  await axios.post('http://localhost:4005/events', {
    type: 'CommentCreated',
    data: {
      id: commentId,
      content,
      status: 'pending',
      postId: req.params.id
    }
  })

  return res.status(201).send(comments)
})

app.post('/events', async (req, res) => {
  const { type, data } = req.body

  if (type === 'CommentModerated') {
    const { postId, id, status } = data
    const comments = commentsByPostId[postId]

    const comment = comments.find(comment => {
      return comment.id === id;
    })

    comment.status = status;

    // now emit comment updated event
    await axios.post('http://localhost:4005/events', {
      type: 'CommentUpdated',
      data: {
        ...data
      }
    })
  }

  console.log('Event Received:', req.body.type)

  res.send({})
})

app.listen(4001, () => console.log('Listening on port 4001!'))