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
      consoleGenerationRecognizer
      controllersCount
      link
      price
    }
  }
`;

const GET_ADVERT_BY_ID = gql`
  query GetAdvertById($adItemId: bigint!) {
    Adverts_by_pk(adItemId: $adItemId) {
      status
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

const UPDATE_MANY_ADVERTS_STATUS = gql`
  mutation UpdateManyAdvertsStatus($ids: [bigint]) {
    update_Adverts_many(
      updates: {
        where: { adItemId: { _in: $ids } }
        _set: { status: "На распознавании" }
      }
    ) {
      affected_rows
    }
  }
`;

const GET_CONVERSATIONS_WITH_MESSAGES = gql`
  query ConversationsWithMessages {
    Conversations {
      adId
      adStatus
      attachmentsEnabled
      buyNowPossible
      id
      numUnread
      role
      sellerName
      customStatus
      manualUpdatedDate
      customUnread
      Messages(order_by: { receivedDate: asc }) {
        receivedDate
      }
    }
  }
`;

const UPDATE_CONVERSATION_RECEIVED_TIME = gql`
  mutation UpdateConvReceivedDate($id: String!, $customLastUpdate: String) {
    update_Conversations_by_pk(
      pk_columns: { id: $id }
      _set: { customLastUpdate: $customLastUpdate }
    ) {
      id
    }
  }
`;

class ApiService {
  client;

  constructor(client) {
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

  getAdvertById = async (adItemId) => {
    try {
      const result = await this.client.query({
        query: GET_ADVERT_BY_ID,
        variables: {
          adItemId,
        },
      });
      return result.data.Adverts_by_pk;
    } catch (err) {
      console.log('ERROR getAdvertById:', err);
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

  getConversationsWithMessages = async () => {
    try {
      const result = await this.client.query({
        query: GET_CONVERSATIONS_WITH_MESSAGES,
      });
      return result.data.Conversations;
    } catch (err) {
      console.log('ERROR getConversationsWithMessage:', err);
    }
  };

  updateConversationLatestDate = async (id, date) => {
    try {
      await this.client.mutate({
        mutation: UPDATE_CONVERSATION_RECEIVED_TIME,
        variables: {
          id,
          customLastUpdate: date,
        },
      });
    } catch (err) {
      console.log('ERROR updateConversationLatestDate:', err);
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

  createChatId = async (chatId) => {
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

  updateAdvertByPk = async (data) => {
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

  updateAdvertsByPk = async (ids) => {
    try {
      await this.client.mutate({
        mutation: UPDATE_MANY_ADVERTS_STATUS,
        variables: {
          ids,
        },
      });
    } catch (err) {
      console.log('ERROR updateAdvertsByPk:', err);
    }
  };
}

const client = makeApolloClient();
const apiService = new ApiService(client);
export { client, apiService, SUBSCRIBE_ADVERTS };
