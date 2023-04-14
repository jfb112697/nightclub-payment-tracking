import { ApolloClient, InMemoryCache } from "@apollo/client";

const token = import.meta.env.VITE_GG_BEARER;

const client = new ApolloClient({
  uri: "https://api.smash.gg/gql/alpha",
  headers: {
    Authorization: token ? `Bearer ${token}` : "",
  },
  cache: new InMemoryCache(),
});

export default client;
