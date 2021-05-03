import { ApolloClient, InMemoryCache, makeVar } from "@apollo/client";
import { generalConcatPagination } from "./helpers/generalConcatPagination";
import { createPersistedQueryLink } from "apollo-link-persisted-queries";
import { createHttpLink } from "apollo-link-http";
import { ApolloLink } from "apollo-link";

export const currentThemeVar = makeVar("dark");
export const checkBoxListVar = makeVar([]);
export const paginationDataVar = makeVar({
  limit: 3,
  offset: 0,
  currentPage: 0,
  totalItemCount: 0,
});

const link = ApolloLink.from([
  createPersistedQueryLink({ useGETForHashedQueries: true }),
  createHttpLink({ uri: "http://localhost:4000/graphql" }),
]);

export const useApollo = () => {
  const options = {
    typePolicies: {
      Query: {
        fields: {
          speakersConcat: generalConcatPagination(),
          sessionsConcat: generalConcatPagination(),
        },
      },
      Speaker: {
        fields: {
          fullName: {
            read: (_, { readField }) => {
              return `${readField("first")} ${readField("last")}`;
            },
          },
          checkBoxColumn: {
            read: (_, { readField }) => {
              const id = readField("id");
              const selectedSpeakerIds = checkBoxListVar();
              return selectedSpeakerIds
                ? selectedSpeakerIds.includes(id)
                : false;
            },
          },
        },
      },
    },
  };

  return new ApolloClient({
    link,
    cache: new InMemoryCache(options),
  });
};
