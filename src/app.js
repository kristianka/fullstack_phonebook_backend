const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
const PORT = process.env.PORT || 3001


morgan.token('body', req => {
    return JSON.stringify(req.body);
});

app.use(express.json());
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));
app.use(cors());
app.use(express.static('build'));

let persons = [
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
    },
    {
        "id": 5,
        "name": "Test",
        "number": "010101"
    }
]


app.get("/api/persons", (req, res) => {
    res.json(persons)
});

app.get("/api/persons/:id", (req, res) => {
    // Convert string to number
    const pId = Number(req.params.id);
    const foundPerson = persons.find(p => p.id === pId) || false;
    if (foundPerson) {
        console.log(`Found person ${foundPerson.name}`);
        res.status(200).send(foundPerson);
    }
    else {
        console.log(`No matches found with the id ${pId}`);
        res.status(404).send("Not found");
    }
});

app.delete("/api/persons/:id", (req, res) => {
    // Convert string to number
    const pId = Number(req.params.id);
    const foundPerson = persons.find(p => p.id === pId) || false;
    if (foundPerson) {
        console.log(`Found person ${foundPerson.name}`);
        persons = persons.filter(p => p.id !== pId);
        console.log(`Deleted ${foundPerson.name}`);
        res.status(204).end()
    }
    else {
        console.log(`No matches found with the id ${pId}`);
        res.status(404).send("Not found");
    }

});

app.post("/api/persons/", (req, res) => {
    const newPerson = {
        "id": Math.floor(Math.random() * (1000 - 5) + 5),
        "name": req.body.name,
        "number": req.body.number
    }

    if (newPerson.name === undefined) {
        return res.status(400).send("Missing name");
    }

    if (newPerson.number === undefined) {
        return res.status(400).send("Missing number")
    }

    if (persons.some(p => p.name === newPerson.name)) {
        return res.status(400).send(`Person with the same name already exists!`);
    }

    console.log(`new person ${newPerson.name}`);
    persons = persons.concat(newPerson);
    console.log(`person is now ${JSON.stringify(persons, null, 2)}`);
    res.status(200).json(newPerson);
})


app.get("/api/info", (req, res) => {
    const currentTime = new Date().toUTCString();
    res.send(`Phonebook has info for ${persons.length} people <br /> ${currentTime}`)
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
});
