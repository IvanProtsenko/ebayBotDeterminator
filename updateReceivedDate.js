import { apiService } from './apiService.js';

async function updateReceivedDate() {
  const allConversations = await apiService.getConversationsWithMessages();
  for (let i = 0; i < allConversations.length; i++) {
    if (allConversations[i].Messages.length > 0) {
      const conv = allConversations[i];
      const latestDate = conv.Messages[conv.Messages.length - 1].receivedDate;
      await apiService.updateConversationLatestDate(conv.id, latestDate);
    }
  }
  console.log('end');
}

updateReceivedDate();
