const { gql, ApolloServer, UserInputError } = require("apollo-server");
const axios = require("axios").default;

const DB_URI = "http://localhost:5000";

const getCursor = (rec) => Buffer.from(rec.toString()).toString("base64");

const getOffsetCustom = (arrData, afterCursor) => {
  const offsetBasedOnFind = arrData.findIndex(
    (objSpeaker) => getCursor(objSpeaker.id) === afterCursor
  );
  return offsetBasedOnFind === -1 ? 0 : offsetBasedOnFind + 1;
};

const typeDefs = gql`
  type Speaker {
    id: ID!
    first: String
    last: String
    favorite: Boolean
    cursor: String
  }

  type PageInfo {
    totalItemCount: Int
    lastCursor: String
    hasNextPage: Boolean
  }

  input SpeakerInput {
    first: String
    last: String
    favorite: Boolean
  }

  type SpeakerResults {
    datalist: [Speaker]
    pageInfo: PageInfo
  }

  type Query {
    speakers(offset: Int = 0, limit: Int = -1): SpeakerResults
    speakersConcat(limit: Int = -1, afterCursor: String = ""): SpeakerResults
  }

  type Mutation {
    toggleSpeakerFavorite(speakerId: Int!): Speaker
    addSpeaker(speaker: SpeakerInput!): Speaker
    deleteSpeaker(speakerId: Int!): Speaker
  }
`;

const resolvers = {
  Query: {
    speakers: async (parent, args, context, info) => {
      const { offset, limit } = args;
      const { data } = await axios.get(`${DB_URI}/speakers`);
      return {
        datalist: data.filter((_, index) => {
          return index > offset - 1 && (offset + limit > index || limit === -1);
        }),
        pageInfo: {
          totalItemCount: data.length,
        },
      };
    },
    speakersConcat: async (parent, args, context, info) => {
      const { limit, afterCursor } = args;
      const { data } = await axios.get(`${DB_URI}/speakers`);
      const arrSortedByName = data.sort((a, b) => a.last.localeCompare(b.last));
      const offset = getOffsetCustom(arrSortedByName, afterCursor);

      const datalist = data
        .filter((_, index) => {
          return index > offset - 1 && (offset + limit > index || limit === -1);
        })
        .map((objSpeaker) => {
          objSpeaker.cursor = getCursor(objSpeaker.id);
          return objSpeaker;
        });

      const pageInfo = {
        totalItemCount: data.length,
        lastCursor:
          datalist.length > 0
            ? getCursor(datalist[datalist.length - 1].id)
            : "",
        hasNextPage: offset + datalist.length < data.length,
      };

      return {
        datalist,
        pageInfo,
      };
    },
  },
  Mutation: {
    toggleSpeakerFavorite: async (parent, args, context, info) => {
      const { data } = await axios.get(`${DB_URI}/speakers/${args.speakerId}`);
      const toggledData = { ...data, favorite: !data.favorite };
      await axios.put(`${DB_URI}/speakers/${args.speakerId}`, toggledData);
      return toggledData;
    },
    addSpeaker: async (parent, args, context, info) => {
      const { data: speakers } = await axios.get(`${DB_URI}/speakers`);
      const { first, last, favorite } = args.speaker;
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
        favorite,
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
