const mongoose = require("mongoose")
require('dotenv').config()
mongoose.set("strictQuery", false);

// set schemas, remove __v: 0 from results
const personSchema = new mongoose.Schema({
    name: String,
    number: String
});
personSchema.set("toJSON", {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
});

// includes your password and username, watch out!
const url = process.env.MONGODB_URI;
mongoose.connect(url)
    .then(console.log("Connected to MongoDB"))
    .catch((error) => {
        console.log("Error connecting to MongoDB:", error.message)
        process.exit(1);
    });

module.exports = mongoose.model("Person", personSchema)