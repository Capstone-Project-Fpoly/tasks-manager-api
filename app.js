const { createServer } = require("http");
const { execute, subscribe } = require("graphql");
const { SubscriptionServer } = require("subscriptions-transport-ws");
const { makeExecutableSchema } = require("graphql-tools");
const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const { ApolloServerPluginLandingPageGraphQLPlayground } = require('apollo-server-core');
const fs = require('fs');
const gql = require('graphql-tag');
const resolvers = require("./src/graphql/resolvers/resolver");
require('dotenv').config();
const path = require('path');
const { default: mongoose } = require("mongoose");
const context = require("./src/graphql/context");
const typeDefs = gql(fs.readFileSync(path.join(__dirname, './src/graphql/schema.gql'), 'utf-8'));
const port = process.env.PORT || 3000;



const startServer = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    const app = express();
    const httpServer = createServer(app);
    const schema = makeExecutableSchema({ typeDefs, resolvers });

    const server = new ApolloServer({
        schema,
        plugins: [
            ApolloServerPluginLandingPageGraphQLPlayground(),
            {
                async serverWillStart() {
                    return {
                        async drainServer() {
                            subscriptionServer.close();
                        },
                    };
                },
            },
        ],
        subscriptions: {
            onConnect: (connectionParams, webSocket,context) => {
                console.log(connectionParams,webSocket,context);
            },
        },
        persistedQueries: false,
        context: context,
    });
    await server.start();

    server.applyMiddleware({ app });


    const subscriptionServer = SubscriptionServer.create(
        {
            schema,
            execute,
            subscribe,
        },
        {
            server: httpServer,
            path: "/graphql",
        }
    );
    app.use(express.static(path.join(__dirname, 'public')));
    httpServer.listen(port, () => {
        console.log(`Server ready at http://localhost:${port}${server.graphqlPath}`);
        console.log(`Subscriptions ready at ws://localhost:${port}/graphql`);
    });
}
startServer();
