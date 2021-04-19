import { useApollo } from "../graphql/apolloClient";
import { ApolloProvider } from "@apollo/client";

const App = ({ Component, pageProps }) => {
  const apolloClient = useApollo();
  return (
    <ApolloProvider client={apolloClient}>
      <Component {...pageProps}></Component>
    </ApolloProvider>
  );
};

export default App;
