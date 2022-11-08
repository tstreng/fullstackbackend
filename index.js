var express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const app = express()
require('dotenv').config()

app.use(express.static('build'))
app.use(express.json())
app.use(cors())
app.use(morgan(function (tokens, req, res) {
  if (tokens.method(req, res) === 'POST') {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'), '-',
      tokens['response-time'](req, res), 'ms',
      JSON.stringify(req.body)
    ].join(' ')
  }
  else {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'), '-',
      tokens['response-time'](req, res), 'ms',
    ].join(' ')
  }
}))

const Person = require('./models/person')

app.get('/api/persons',(request, response) => {
  Person.find({}).then(phonebook => {
    response.json(phonebook)
  })
})

app.get('/api/persons/:id',(request,response) => {
  Person.findById(request.params.id)
    .then(person => {
      if(person){
        response.json(person)
      }
      else{
        response.status(404).end()
      }

    }
    )
    .catch( (error) =>
      response.status(404).send(`Error: ${error}`)
    )
})

app.put('/api/persons/:id',(request,response,next) => {
  const body = request.body
  const person = {
    name: body.name,
    number: body.number
  }
  Person.findByIdAndUpdate(request.params.id,person, { new:true, runValidators:true })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

app.get('/info',(request,response) => {
  Person.countDocuments({}).then(number =>
    response.send(`Phonebook has info for ${number} people
    ${new Date()}
    `))
})

app.post('/api/persons', (request, response,next) => {
  const body = request.body
  if (!body.name) {
    return response.status(400).json({
      error: 'Name missing'
    })
  }
  else if(!body.number){
    return response.status(400).json({
      error: 'Number missing'
    })
  }
  else if (Person.find({ name:body.name }).length>0){
    return response.status(400).json({
      error: 'Name already in phonebook'
    })
  }
  const person = new Person({
    name : body.name,
    number : body.number,
  })
  person.save().then(savedPerson =>
    response.json(savedPerson)
  )
    .catch(error => next(error))
})

app.delete('/api/persons/:id',(request,response,next) => {
  Person.findByIdAndRemove(request.params.id)
    .then( () => {
      response.status(204).end()})
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error,request,response,next) => {
  console.error(error.message)
  if (error.name === 'CastError'){
    return response.status(400).send({ error:'Malformatted id' })
  }
  else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  else{
    next(error)
  }
}
app.use(errorHandler)
const PORT = process.env.PORT || 8080
app.listen(PORT)
console.log(`Server running on port ${PORT}`)