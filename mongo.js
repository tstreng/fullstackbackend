const mongoose = require('mongoose')
const pw = process.argv[2]
const url = `mongodb+srv://toonska:${pw}@phonebookbackend.sxlsxwa.mongodb.net/phonebook?retryWrites=true&w=majority`
const phonebookSchema = new mongoose.Schema({
  name: String,
  number: String
})
const Person = mongoose.model('Person',phonebookSchema)

if (process.argv.length > 4){
  const name = process.argv[3]
  const number = process.argv[4]
  mongoose
    .connect(url)
    .then(() => {
      const person = new Person({
        name:name,
        number:number
      })
      return person.save()
    })
    .then(() => {
      console.log(`Added ${name} number ${number} to database`)
      return mongoose.connection.close()
    })
    .catch((err) => console.log(`${name} failed: ${err}`))

}
else {
  mongoose
    .connect(url)
    .then(() => {
      console.log('Phonebook:')
      Person.find({}).then((result) => {
        result.forEach(person =>
          console.log(`${person.name} ${person.number}`))
        return mongoose.connection.close()
      })
    })
    .catch((err) => console.log(`Get persons failed: ${err}`))
}
