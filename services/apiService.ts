import makeApolloClient from './makeApolloClient.js';
import gql from 'graphql-tag';
// import client from './makeApolloClientServer.js';

const GET_ADVERTS = gql`
  query GetAdverts {
    Adverts {
      adItemId
      buyNowAllowed
      consoleGeneration
      controllersCount
      created_at
      deliveryAllowed
      description
      hasDefect
      initialResponse
      link
      location
      offerAllowed
      price
      publishDate
      recommendedPrice
      status
      title
      tradeAllowed
    }
  }
`;

const GET_LATEST_ADVERTS = gql`
  query GetLatestAdverts {
    Adverts(order_by: { created_at: desc }) {
      adItemId
      buyNowAllowed
      consoleGeneration
      controllersCount
      created_at
      deliveryAllowed
      description
      hasDefect
      initialResponse
      link
      location
      offerAllowed
      price
      publishDate
      recommendedPrice
      status
      title
      tradeAllowed
    }
  }
`;

const GET_POLLING_ADVERTS = gql`
  query GetPollingAdverts {
    Adverts(where: { status: { _eq: "Ручное распознавание" } }) {
      adItemId
      consoleGeneration
      controllersCount
      link
    }
  }
`;

const GET_ALL_MESSAGES = gql`
  query GetMessages {
    Messages {
      id
    }
  }
`;

const SUBSCRIBE_ADVERTS = gql`
  subscription MySubscription {
    Adverts(
      where: { status: { _eq: "Ручное распознавание" } }
      order_by: { created_at: desc }
    ) {
      adItemId
      buyNowAllowed
      consoleGeneration
      controllersCount
      deliveryAllowed
      hasDefect
      link
      offerAllowed
      status
      title
      tradeAllowed
      viewed
    }
  }
`;

const GET_CHAT_IDS = gql`
  query GetChatIds {
    chat_ids {
      id
    }
  }
`;

const CREATE_CHAT_ID = gql`
  mutation CreateChatId($id: bigint) {
    insert_chat_ids_one(object: { id: $id }) {
      id
    }
  }
`;

const UPDATE_ADVERT_BY_PK = gql`
  mutation MyMutation2($id: bigint!, $_set: Adverts_set_input) {
    update_Adverts_by_pk(pk_columns: { adItemId: $id }, _set: $_set) {
      adItemId
    }
  }
`;

class ApiService {
  client;

  constructor(client: any) {
    this.client = client;
  }

  reload = async () => {
    const client = makeApolloClient();
    this.client = client;
  };

  getAdverts = async () => {
    try {
      const result = await this.client.query({
        query: GET_ADVERTS,
      });
      return result.data.Adverts;
    } catch (err) {
      console.log('ERROR getAdverts:', err);
    }
  };

  getLatestAdverts = async () => {
    try {
      const result = await this.client.query({
        query: GET_LATEST_ADVERTS,
      });
      return result.data.Adverts;
    } catch (err) {
      console.log('ERROR getLatestAdverts:', err);
    }
  };

  getPollingAdverts = async () => {
    try {
      const result = await this.client.query({
        query: GET_POLLING_ADVERTS,
      });
      return result.data.Adverts;
    } catch (err) {
      console.log('ERROR getPollingAdverts:', err);
    }
  };

  getMessages = async () => {
    try {
      const result = await this.client.query({
        query: GET_ALL_MESSAGES,
      });
      return result.data.Messages;
    } catch (err) {
      console.log('ERROR getMessages:', err);
    }
  };

  createChatId = async (chatId: any) => {
    try {
      await this.client.mutate({
        mutation: CREATE_CHAT_ID,
        variables: {
          id: chatId,
        },
      });
    } catch (err) {
      console.log('ERROR createChatId:', err);
    }
  };

  getChatIds = async () => {
    try {
      const result = await this.client.query({
        query: GET_CHAT_IDS,
      });
      return result.data.chat_ids;
    } catch (err) {
      console.log('ERROR getChatIds:', err);
    }
  };

  updateAdvertByPk = async (data: any) => {
    try {
      await this.client.mutate({
        mutation: UPDATE_ADVERT_BY_PK,
        variables: {
          id: data.adItemId,
          _set: data,
        },
      });
    } catch (err) {
      console.log('ERROR updateAdvertByPk:', err);
    }
  };
}

const client = makeApolloClient();
const apiService = new ApiService(client);
export { client, apiService, SUBSCRIBE_ADVERTS };
