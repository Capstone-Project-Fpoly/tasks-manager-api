const { createServer } = require("http");
const express = require("express");
const { ApolloServer } = require("@apollo/server");
const { ApolloServerPluginDrainHttpServer } = require("apollo-server-core");

const { startStandaloneServer } = require("@apollo/server/standalone");

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
//
const { makeExecutableSchema } = require("@graphql-tools/schema");
const { WebSocketServer } = require("ws");
const { useServer } = require("graphql-ws/lib/use/ws");
const cors = require("cors");
const { expressMiddleware } = require("@apollo/server/express4");
const { PubSub } = require("graphql-subscriptions");
const { log } = require("console");
const { isContext } = require("vm");

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

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/graphql",
    handleProtocols: (protocols, req) => {
      return "graphql-ws";
    },
  });

  const serverCleanup = useServer(
    {
      schema,
      context: async (ctx, msg, args) => {},
    },
    wsServer
  );

  const server = new ApolloServer({
    schema,
    context,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });
  await server.start();

  app.use(
    "/graphql",
    cors(),
    express.json(),
    expressMiddleware(server, {
      context: context,
    })
  );

  app.use(express.static(path.join(__dirname, "public")));
  app.get("/", (req, res) => {
    const indexPath = path.join(__dirname, "index.html");
    res.sendFile(indexPath);
  });
  route(app);
  httpServer.listen(port, () => {
    console.log(`Server ready at http://localhost:${port}/graphql`);
    console.log(`Subscriptions ready at ws://localhost:${port}/graphql`);
  });
};
startServer();
