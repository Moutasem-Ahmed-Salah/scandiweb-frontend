import React from "react";
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client";
import HomePage from "./Components/HomePage";

const client = new ApolloClient({
  uri: "http://localhost/graphql.php",
  cache: new InMemoryCache(),
});

function App() {
  return (
    <ApolloProvider client={client}>
      <HomePage />
    </ApolloProvider>
  );
}

export default App;
