const mongoose = require("mongoose")
require('dotenv').config()
mongoose.set("strictQuery", false);

const personSchema = new mongoose.Schema({
    name: String,
    number: String
})

const Person = mongoose.model("Person", personSchema)

//const password = process.argv[2]
// includes your password and username, watch out!
const url = process.env.MONGODB_URI;
const argv = process.argv;

mongoose.connect(url)
    .catch((error) => {
        console.log("Error connecting to MongoDB:", error.message)
        process.exit(1);
    });

if (argv.length < 4 && argv.length !== 2) {
    console.log(`Too few arguments. Example: "node mongo.js Einari 0123456"`);
    process.exit(1);
}

if (process.argv.length === 2) {
    Person
        .find({})
        .then(res => {
            console.log("Phonebook")
            res.forEach(p => {
                console.log(`${p.name} ${p.number}`);
            })
            mongoose.connection.close();
            process.exit(1);
        })
        .catch(err => {
            console.log(`An error occured during fetch from DB. ${err.message}`);
            mongoose.connection.close();
            process.exit(1);
        })
}
else {
    const person = new Person({
        name: process.argv[2],
        number: process.argv[3]
    });

    person
        .save()
        .then(res => {
            console.log(`Successfully added ${person.name} ${person.number} to the phonebook!`);
            mongoose.connection.close();
        })
        .catch(err => {
            console.log(`An error occured during writing to DB. ${err.message}`);
            mongoose.connection.close();
        });
}