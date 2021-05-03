const { gql, ApolloServer, UserInputError } = require("apollo-server");
const axios = require("axios").default;
const DataLoader = require("dataloader");

const DB_URI = "http://localhost:5000";

const getCursor = (rec) => Buffer.from(rec.toString()).toString("base64");

const getOffsetCustom = (arrData, afterCursor) => {
  const offsetBasedOnFind = arrData.findIndex(
    (objSpeaker) => getCursor(objSpeaker.id) === afterCursor
  );
  return offsetBasedOnFind === -1 ? 0 : offsetBasedOnFind + 1;
};

const typeDefs = gql`
  type Room {
    id: ID!
    name: String
    capacity: Int
  }

  type Speaker @cacheControl(maxAge: 3600) {
    id: ID!
    first: String
    last: String
    company: String
    twitterHandle: String
    bio: String
    favorite: Boolean @cacheControl(maxAge: 5, scope: PRIVATE)
    cursor: String
    sessions: [Session] @cacheControl(maxAge: 600)
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

  type Session {
    id: ID!
    title: String!
    eventYear: String
    cursor: String
    room: Room
  }

  type SessionResults {
    datalist: [Session]
    pageInfo: PageInfo
  }

  type Query {
    speakers(offset: Int = 0, limit: Int = -1): SpeakerResults
    speakersConcat(limit: Int = -1, afterCursor: String = ""): SpeakerResults
    sessionsConcat(limit: Int = -1, afterCursor: String = ""): SessionResults
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
    sessionsConcat: async (parent, args, context, info) => {
      const { limit, afterCursor } = args;
      const { data } = await axios.get(`${DB_URI}/sessions`);
      const arrSortedByName = data.sort((a, b) =>
        a.eventYear.localeCompare(b.eventYear)
      );
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
  Session: {
    room: async (parent, args, { roomLoader }, info) => {
      const roomId = parent.roomId;
      return roomLoader.load(roomId);
      // const responseRooms = await axios.get(`${DB_URI}/rooms`);
      // const roomRec = responseRooms.data.find(
      //   (objRoom) => objRoom.id === roomId
      // );
      // return roomRec;
    },
  },
  Speaker: {
    sessions: async (parent, args, { sessionsLoader }, info) => {
      info.cacheControl.setCacheHint({ maxAge: 600, scope: "PUBLIC" });
      const speakerId = parent.id;
      return sessionsLoader.load(speakerId);
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
    context: () => {
      return {
        roomLoader: new DataLoader(async (roomIds) => {
          const responseRooms = await axios.get(`${DB_URI}/rooms`);

          const roomMap = responseRooms.data.reduce((objMap, objCurrent) => {
            objMap[objCurrent.id] = objCurrent;
            return objMap;
          }, {});

          const arrSelectdRooms = roomIds.map((roomId) => roomMap[roomId]);
          return arrSelectdRooms;
        }),
        sessionsLoader: new DataLoader(async (speakerIds) => {
          const responseSessions = await axios.get(`${DB_URI}/sessions`);
          const responseSessionSpeakers = await axios.get(
            `${DB_URI}/sessionSpeakers`
          );

          const sessionIds = responseSessionSpeakers.data
            .filter((objSessionSpeaker) =>
              speakerIds.includes(objSessionSpeaker.speakerId)
            )
            .map((objSessionSpeaker) => objSessionSpeaker.sessionId);

          const sessionsResult = responseSessions.data.filter((objSession) =>
            sessionIds.includes(objSession.id)
          );

          let sessionsForSpeakerMap = {};

          speakerIds.forEach((speakerId) => {
            const sessionIdsForSpeaker = responseSessionSpeakers.data
              .filter((sessionSpeakerRec) => {
                return sessionSpeakerRec.speakerId === speakerId;
              })
              .map((sessionSpeakerRec) => {
                return sessionSpeakerRec.sessionId;
              });

            const sessionsForSpeaker = sessionsResult.filter((session) => {
              return sessionIdsForSpeaker.includes(session.id);
            });

            sessionsForSpeakerMap[speakerId] = sessionsForSpeaker;
          });

          return speakerIds.map((speakerId) => {
            return sessionsForSpeakerMap[speakerId];
          });
        }),
      };
    },
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
