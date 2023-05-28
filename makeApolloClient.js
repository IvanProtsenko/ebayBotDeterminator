const {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  split,
} = pkg;
import pkg from '@apollo/client/core/core.cjs';
import { getMainDefinition } from '@apollo/client/utilities/utilities.cjs';
import fetch from 'cross-fetch';
import { WebSocketLink } from '@apollo/client/link/ws/ws.cjs';
import { SubscriptionClient } from 'subscriptions-transport-ws/dist/client.js';
import dotenv from 'dotenv'
import ws from 'ws';

dotenv.config()

function getHttpLink() {
  return new HttpLink({
    uri: process.env.API_URL,
    fetch,
    headers: { 'x-hasura-admin-secret': `${process.env.API_TOKEN}` },
  });
}

function getWssLink() {
  return new WebSocketLink(
    new SubscriptionClient(
      process.env.API_WS_URL,
      {
        reconnect: true,
        connectionParams: {
          headers: {
            'x-hasura-admin-secret': `${process.env.API_TOKEN}`,
          },
        },
      },
      ws
    ),
  );
}

function getSplittedLink(httpLink, wsLink) {
  const splitLink = split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
      );
    },
    wsLink,
    httpLink
  );

  return splitLink;
}

export default function makeApolloClient() {
  const httpLink = getHttpLink();
  const wssLink = getWssLink();
  
  const splitLink = getSplittedLink(httpLink, wssLink);
  
  const client = new ApolloClient({
    link: splitLink,
    cache: new InMemoryCache(),
  });

  return client;
}
