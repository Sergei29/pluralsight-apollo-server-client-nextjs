const { gql, ApolloServer, UserInputError } = require("apollo-server");
const axios = require("axios").default;

const DB_URI = "http://localhost:5000";

const typeDefs = gql`
  type Speaker {
    id: ID!
    first: String
    last: String
    favourite: Boolean
  }

  input SpeakerInput {
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

  type Mutation {
    toggleSpeakerFavourite(speakerId: Int!): Speaker
    addSpeaker(speaker: SpeakerInput!): Speaker
    deleteSpeaker(speakerId: Int!): Speaker
  }
`;

const resolvers = {
  Query: {
    speakers: async (parent, args, context, info) => {
      const { data } = await axios.get(`${DB_URI}/speakers`);
      return {
        datalist: data,
      };
    },
  },
  Mutation: {
    toggleSpeakerFavourite: async (parent, args, context, info) => {
      const { data } = await axios.get(`${DB_URI}/speakers/${args.speakerId}`);
      const toggledData = { ...data, favourite: !data.favourite };
      await axios.put(`${DB_URI}/speakers/${args.speakerId}`, toggledData);
      return toggledData;
    },
    addSpeaker: async (parent, args, context, info) => {
      const { data: speakers } = await axios.get(`${DB_URI}/speakers`);
      const { first, last, favourite } = args.speaker;
      const foundRecord = speakers.find(
        (speaker) => speaker.first === first && speaker.last === last
      );

      if (foundRecord) {
        throw new UserInputError(`Speaker ${first} ${last} already exists.`, {
          invalidArgs: Object.keys(args),
        });
      }

      const { data: newSpeaker } = await axios.post(`${DB_URI}/speakers`, {
        first,
        last,
        favourite,
      });

      return newSpeaker;
    },
    deleteSpeaker: async (parent, args, context, info) => {
      const { data: foundSpeaker } = await axios.get(
        `${DB_URI}/speakers/${args.speakerId}`
      );

      await axios.delete(`${DB_URI}/speakers/${args.speakerId}`);
      return foundSpeaker;
    },
  },
};

async function apolloServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  const PORT = process.env.PORT || 4000;

  try {
    server.listen(PORT, () => {
      console.log(`Server starting at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log(error.message);
  }
}

apolloServer();
