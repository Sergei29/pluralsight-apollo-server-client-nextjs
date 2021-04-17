const { gql, ApolloServer } = require("apollo-server");

const typeDefs = gql`
  type Speaker {
    id: ID!
    first: String
    last: String
    favourite: Boolean
  }

  type SpeakerResults {
    datalist: [Speaker]
  }

  type Query {
    speakers: SpeakerResults
  }
`;

const resolvers = {
  Query: {
    speakers: (parent, args, context, info) => {
      const speakerResults = {
        datalist: [
          { id: "101", first: "David", last: "Jones", favourite: null },
          { id: "102", first: "Tom", last: "Lewis", favourite: null },
          { id: "103", first: "Dough", last: "Thompson", favourite: null },
        ],
      };
      return speakerResults;
    },
  },

  SpeakerResults: {
    datalist: (parent, args, context, info) => {
      return parent.datalist;
    },
  },

  Speaker: {
    id: (parent, args, context, info) => {
      return parent.id;
    },
    first: (parent, args, context, info) => {
      return parent.first;
    },
    last: (parent, args, context, info) => {
      return parent.last;
    },
    favourite: (parent, args, context, info) => {
      return parent.favourite;
    },
  },
};

async function apolloServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  try {
    server.listen(4000, () => {
      console.log("Server starting at http://localhost:4000");
    });
  } catch (error) {
    console.log(error.message);
  }
}

apolloServer();
