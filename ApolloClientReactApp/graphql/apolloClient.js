import { ApolloClient, InMemoryCache, makeVar } from "@apollo/client";

export const currentThemeVar = makeVar("dark");
export const checkBoxListVar = makeVar([]);

export const useApollo = () => {
  const options = {
    typePolicies: {
      Speaker: {
        fields: {
          fullName: {
            read: (_, { readField }) => {
              return `${readField("first")} ${readField("last")}`;
            },
          },
          checkBoxColumn: (_, { readField }) => {
            const id = readField("id");
            const selectedSpeakerIds = checkBoxListVar();
            return selectedSpeakerIds ? selectedSpeakerIds.includes(id) : false;
          },
        },
      },
    },
  };

  return new ApolloClient({
    uri: "http://localhost:4000",
    cache: new InMemoryCache(options),
  });
};
