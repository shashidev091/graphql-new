const express = require('express');
const graphqlHTTP = require('express-graphql');
const { buildSchema } = require('graphql');

const app = express();

app.use(express.json());

app.use('/graphql', graphqlHTTP({
    schema: buildSchema(`
        type RootQuery {
            events: [String!]
        }

        type RootMutation {
            createEvents(name: String): String
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }

    `),
    rootValue: null,
    graphiql: true
}))

app.get('/', (req, res) => {
    res.send('<h4>Welcome this is your home page</h4>')
})

app.listen(4000, () => console.log('server started at 4000'));