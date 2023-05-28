import dotenv from 'dotenv'
import TelegramBot from 'node-telegram-bot-api';
import { apiService, client, SUBSCRIBE_ADVERTS } from './apiService.js';

dotenv.config()

const bot = new TelegramBot(process.env.BOT_TOKEN, {polling: true});
let chatIds = [259567367, 348494653]
let latestAdvertId = null

async function init() {
//   chatIds = await apiService.getChatIds()
//   chatIds = chatIds.map(chatId => chatId.id)
    const adverts = await apiService.getLatestAdverts()
    latestAdvertId = adverts[0].adItemId
}

bot.on('poll', (msg) => {
    const id = msg.question.split('\n')[0]
    msg.options.forEach(async option => {
        if(option.voter_count == 1) {
            if(Number(option.text)) {
                console.log('update controllers count')
                await apiService.updateAdvertByPk({adItemId: id, controllersCount: option.text, status: 'Решение'})
            } else { 
                console.log('update consoleType')
                await apiService.updateAdvertByPk({adItemId: id, consoleGeneration: option.text, status: 'Решение'})
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

const observer = client.subscribe({
  query: SUBSCRIBE_ADVERTS,
});
observer.subscribe({
  async next(data) {
    const advert = data.data.Adverts[0]
    console.log(advert)
    if(advert && advert.adItemId != latestAdvertId) {
        latestAdvertId = advert.adItemId
        if(!advert.controllersCount && !advert.consoleGeneration) {
            chatIds.forEach(async chatId => {
                await bot.sendMessage(chatId, advert.link)
                bot.sendPoll(chatId, `${advert.adItemId}\nСколько контроллеров?`, ['0', '1', '2', '3'], {allows_multiple_answers: false})
                bot.sendPoll(chatId, `${advert.adItemId}\nТип консоли?`, ['FAT', 'SLIM', 'PRO', 'NOT_PS4'], {allows_multiple_answers: false})
            })
        } else if(!advert.controllersCount && advert.consoleGeneration != 'FAT') {
            chatIds.forEach(async chatId => {
                await bot.sendMessage(chatId, advert.link)
                bot.sendPoll(chatId, `${advert.adItemId}\nСколько контроллеров?`, ['0', '1', '2', '3'], {allows_multiple_answers: false})
            })
        } else if(!advert.consoleGeneration) {
            chatIds.forEach(async chatId => {
                await bot.sendMessage(chatId, advert.link)
                bot.sendPoll(chatId, `${advert.adItemId}\nТип консоли?`, ['FAT', 'SLIM', 'PRO', 'NOT_PS4'], {allows_multiple_answers: false})
            })
        }
    }
  },
  error(err) {
    console.log(err);
  },
});

await init()