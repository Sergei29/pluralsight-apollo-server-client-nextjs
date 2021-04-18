import React from "react";
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";

const App = ({ Component, pageProps }) => {
  const apolloClient = new ApolloClient({
    uri: "http://localhost:4000",
    cache: new InMemoryCache(),
  });
  return (
    <ApolloProvider client={apolloClient}>
      <Component {...pageProps}></Component>
    </ApolloProvider>
  );
};

export default App;
