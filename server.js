const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const app = express();

const Event = require('./models/event');
const User = require('./models/user');

app.use(express.json());

app.use('/graphql', graphqlHTTP({
    schema: buildSchema(`
        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        type User {
            _id: ID!
            email: String!
            password: String!
        }

        input EventInput {
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        input UserInput {
            email: String!
            password: String!
        }

        type RootQuery {
            events: [Event!]!
            getAllUsers: [User!]!
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
            createUser(userInput: UserInput): User
        } 

        schema {
            query: RootQuery
            mutation: RootMutation
        }

    `),
    rootValue: {
        events: () => {
            return Event.find().then(result => {
                return result.map(event => {
                    return {...event._doc}
                })
            })
        },
        createEvent: (args) => {
            // const event = {
            //     _id: Math.random().toString,
            //     title: args.eventInput.title,
            //     description: args.eventInput.description,
            //     price: +args.eventInput.price,
            //     date: args.eventInput.date
            // }

            const event = new Event({
                title: args.eventInput.title,
                description: args.eventInput.description,
                price: +args.eventInput.price,
                date: new Date(args.eventInput.date)
            })
            return event.save().then(result => {
                return {...result._doc};
            }).catch(err => {
                // console.log(err);
                throw err;
            })
        },

        createUser: args => {
            return bcrypt.hash(args.userInput.password, 12)
            .then(hashedPassword => {
                const user = new User({
                    email: args.userInput.email,
                    password: hashedPassword
                });
                return user.save();
            })
            .then(result => {
                return {...result._doc}
            })
            .catch(err => {
                throw err;
            })
        },
        getAllUsers: () => {
            return User.find().then(users => {
                return users.map(user => {
                    return {...user._doc}
                })
            })
        }
    },
    graphiql: true
}))

app.get('/', (req, res) => {
    res.send('<h4>Welcome this is your home page</h4>')
})

// Connection to Servers 
mongoose.connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@graphql.rna1k.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`,
    { useUnifiedTopology: true, useNewUrlParser: true })
    .then(() => {
        app.listen(4000, () => console.log('server started at 4000'));
    })
    .catch(err => {
        console.log(err);
    })