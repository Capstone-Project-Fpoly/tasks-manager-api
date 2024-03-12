const { createServer } = require("http");
const { execute, subscribe } = require("graphql");
const { SubscriptionServer } = require("subscriptions-transport-ws");
const { makeExecutableSchema } = require("graphql-tools");
const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const {
  ApolloServerPluginLandingPageGraphQLPlayground,
} = require("apollo-server-core");
const fs = require("fs");
const gql = require("graphql-tag");
const resolvers = require("./src/graphql/resolvers/resolver");
require("dotenv").config();
const path = require("path");
const { default: mongoose } = require("mongoose");
const context = require("./src/graphql/context");
const typeDefs = gql(
  fs.readFileSync(path.join(__dirname, "./src/graphql/schema.gql"), "utf-8")
);
const port = process.env.PORT || 3000;
const admin = require("firebase-admin");
const route = require("./src/route/app");

const serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
};

const startServer = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  const app = express();
  const httpServer = createServer(app);
  const schema = makeExecutableSchema({ typeDefs, resolvers });

  const server = new ApolloServer({
    schema,
    context,
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
      onConnect: (connectionParams, webSocket, context) => {
        console.log("đã kết nói websocket");
        console.log(connectionParams, webSocket, context);
      },
    },
    introspection: true,
    persistedQueries: false,
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
  app.use(express.static(path.join(__dirname, "public")));
  app.get("/", (req, res) => {
    const indexPath = path.join(__dirname, "index.html");
    res.sendFile(indexPath);
  });
  route(app);
  httpServer.listen(port, () => {
    console.log(
      `Server ready at http://localhost:${port}${server.graphqlPath}`
    );
    console.log(`Subscriptions ready at ws://localhost:${port}/graphql`);
  });
};
startServer();
