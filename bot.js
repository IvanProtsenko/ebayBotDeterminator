// import { apiService, client, SUBSCRIBE_MESSAGES } from './apiService.js';
import dotenv from 'dotenv'
import TelegramBot from 'node-telegram-bot-api';

dotenv.config()

const bot = new TelegramBot(process.env.BOT_TOKEN, {polling: true});
let chatIds = []
let latestMessageId = 0

// async function init() {
//   let messageIds = await apiService.getMessages()
//   messageIds = messageIds.map(message => message.id)
//   latestMessageId = Math.max.apply(Math, messageIds)
//   chatIds = await apiService.getChatIds()
//   chatIds = chatIds.map(chatId => chatId.id)
// }

bot.on('poll', (msg) => {
    const id = msg.question.split('\n')[0]
    msg.options.forEach(option => {
        if(option.voter_count == 1) {
            if(Number(option.text)) {
                console.log('update controllers count')
                // update advert (id, contrtollersCount: option.text)
            } else { 
                console.log('update consoleType')
                // update advert (id, consoleType: option.text)
            }
        }
        
        
    });
});

bot.onText(/\/subscribe/, async (msg, match) => {
  const chatId = msg.chat.id;
  const link = "https://www.kleinanzeigen.de/s-anzeige/playstation-4-500gb/2451423494-279-1797"
  const id = "54982895"
//   await apiService.createChatId(chatId)
//   chatIds = await apiService.getChatIds()
//   chatIds = chatIds.map(chatId => chatId.id)
//   bot.sendMessage(chatId, 'You are subscribed for messages');
  bot.sendMessage(chatId, link)
  bot.sendPoll(chatId, `${id}\nСколько контроллеров?`, ['0', '1', '2', '3'], {allows_multiple_answers: false})
  bot.sendPoll(chatId, `${id}\nТип консоли?`, ['FAT', 'SLIM', 'PRO'], {allows_multiple_answers: false})
});

// const observer = client.subscribe({
//   query: SUBSCRIBE_MESSAGES,
// });
// observer.subscribe({
//   async next(data) {
//     data.data.Messages.forEach(message => {
//       if(message.id > latestMessageId) {
//         chatIds.forEach(chatId => {
//             bot.startPolling([1, 2])
//           bot.sendMessage(chatId, 
//           "Текст сообщения: \n" + message.text +
//           "\nЦена: " + message.Advert.price +
//           "\nРекомендуемая цена: " + message.Advert.recommendedPrice + 
//           "\nПоколение: " + message.Advert.consoleGeneration + 
//           "\nКонтроллеров: " + message.Advert.controllersCount + "\n" + message.Advert.link);
//         });
//         latestMessageId = message.id
//       }
//     });
    
//   },
//   error(err) {
//     console.log(err);
//   },
// });

// await init()