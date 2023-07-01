const mongoose = require("mongoose");
require("dotenv").config();
mongoose.set("strictQuery", false);

// set schemas, remove __v: 0 from results
// some very difficult regex that ensures phone numbers are
// formatted correctly, like 123-45678
function phoneValidator(value) {
    const regex = /^\d{2,3}-\d{6,}$/;
    return regex.test(value);
}

const personSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: 3,
        required: true
    },
    number: {
        type: String,
        minLength: 8,
        required: true,
        validate: {
            validator: phoneValidator,
            message: "Invalid phone number. Must have atleast 8 numbers and a dash after the first 2 or 3 numbers."
        }
    }
});
personSchema.set("toJSON", {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    }
});

// includes your password and username, watch out!
const url = process.env.MONGODB_URI;
mongoose.connect(url)
    .then(console.log("Connected to MongoDB"))
    .catch((error) => {
        console.log("Error connecting to MongoDB:", error.message);
        process.exit(1);
    });

module.exports = mongoose.model("Person", personSchema);