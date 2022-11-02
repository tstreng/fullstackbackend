
let phonebook = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]
var express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const app = express()
app.use(cors())
app.use(morgan(function (tokens, req, res) {
    if (tokens.method(req, res) === "POST") {
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
app.use(express.json())

const generateId = () => {
    const maxId = phonebook.length > 0
      ? Math.max(...phonebook.map(n => n.id))
      : 0
    return maxId + 1
  }

app.get('/api/persons',(request, response) => {
    response.send(phonebook)
})

app.get('/api/persons/:id',(request,response)=>{
    const id = Number(request.params.id)
    const person = phonebook.find(p => p.id === id)
    if (person){
        response.json(person)
    }
    else {
        response.status(404).send(`Person with id ${id} not found in phonebook.`)
    }
})

app.get('/info',(request,response)=>{
    response.send(`Phonebook has info for ${phonebook.length} people
    ${new Date()}
    `)
})

app.post('/api/persons', (request, response) => {
    const body = request.body
    console.log(body)
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
    else if (phonebook.find(p=>p.name === body.name)){
        return response.status(400).json({
            error: 'Name already in phonebook'
        })
    }
    const person = {
        name : body.name,
        number : body.number,
        id : generateId()
    }
    phonebook = phonebook.concat(person)
    response.json(person)
})

app.delete('/api/persons/:id',(request,response)=>{
    const id = Number(request.params.id)
    phonebook = phonebook.filter(p => p.id !== id)

    response.status(204).end()
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }
  
app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)