const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
const Person = require("./models/person");
const PORT = process.env.PORT || 3001;

morgan.token('body', req => {
    return JSON.stringify(req.body);
});

app.use(express.json());
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));
app.use(cors());
app.use(express.static('build'));

const unknownEndpoint = (req, res) => {
    res.status(404).send("Not found")
}

const errorHandler = (error, req, res, next) => {
    console.error(error.message);
    if (error.name === "CastError") {
        return res.status(400).send("Incorrect formatting");
    }
    if (error.name === "MongoConnectionException") {
        return res.status(500).send("Server error. Please try again later");
    }
    if (error.name === "ValidationError") {
        return res.status(400).send("Invalid data");
    }
    if (error.name === "MongoError" && error.code === 11000) {
        return res.status(409).send("Duplicate key error");
    }
    if (error.name === "MongoError" && error.code === 2) {
        return res.status(503).send("Operation failed");
    }
    next(error);
}

app.get("/api/persons", (req, res) => {
    Person
        .find({})
        .then(people => {
            res.json(people);
        })
        .catch(err => next(err));
});

app.get("/api/persons/:id", async (req, res, next) => {
    const id = req.params.id;
    Person.findById(id)
        .then(foundPerson => {
            if (foundPerson) {
                console.log(`Found person ${foundPerson.name}`);
                res.status(200).send(foundPerson);
            }
            next();
        })
        .catch(err => next(err));
});

app.post("/api/persons/", (req, res) => {
    const newPerson = new Person({
        "name": req.body.name,
        "number": req.body.number
    });

    if (newPerson.name === undefined) {
        return res.status(400).send("Missing name");
    }

    if (newPerson.number === undefined) {
        return res.status(400).send("Missing number")
    }

    // skip for now
    // if (persons.some(p => p.name === newPerson.name)) {
    //     return res.status(400).send(`Person with the same name already exists!`);
    // }

    newPerson
        .save()
        .then(savedPerson => {
            console.log(`Added ${newPerson.name} ${newPerson.number}`);
            res.status(201).json(savedPerson);
        })
        .catch(err => next(err));
});

app.put("/api/persons/:id", (req, res, next) => {
    const id = req.params.id;
    const updatedPerson = {
        "name": req.body.name,
        "number": req.body.number
    };

    Person
        .findByIdAndUpdate(id, updatedPerson, { new: true })
        .then(updatedPerson => {
            res.status(200).json(updatedPerson);
            console.log(updatedPerson);
        })
        .catch(err => next(err));
})

app.delete("/api/persons/:id", (req, res, next) => {
    const id = req.params.id;
    Person
        .findByIdAndDelete(id)
        .then(foundPerson => {
            if (foundPerson) {
                console.log(`Deleted ${foundPerson.name}`);
                res.status(204).end()
            }
            else {
                console.log(`No matches found with the id ${pId}`);
                res.status(404).send("Not found");
            }
        })
        .catch(err => next(err));
});

app.get("/api/info", (req, res) => {
    const currentTime = new Date().toUTCString();
    Person
        .count()
        .then(count => {
            res.send(`Phonebook has info for ${count} people <br /> ${currentTime}`)
        })
        .catch(err => next(err));
});

app.use(unknownEndpoint);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
});
