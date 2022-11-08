const mongoose = require('mongoose')

const url = process.env.MONGODB_URL

console.log('Connecting to database')

mongoose.connect(url)
  .then(() => {
    console.log('Connected to phonebook MongoDB')
  })
  .catch((error) => {
    console.log('Error connecting to phonebook MongoDB:', error.message)
  })

const phonebookSchema = new mongoose.Schema({
  name:{
    type: String,
    minLength: [3,'Too short name, minumum length of 3 got {VALUE}'],
    required: true

  },
  number:{
    type:String,
    minLength:8,
    validate:{ validator:(v) => {
      return /(\d{2}-\d{6,})|(\d{3}-\d{5,})|(\d{8,})/g.test(v)}
    },
    required: true
  }
})
mongoose.model('Person',phonebookSchema)
phonebookSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', phonebookSchema)