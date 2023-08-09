import dotenv from 'dotenv';
import TelegramBot from 'node-telegram-bot-api';
import { apiService } from './../services/apiService.js';

dotenv.config();

const bot = new TelegramBot(process.env.BOT_TOKEN!, { polling: true });
let chatIds = [259567367, 348494653, 1629479461, 945138731];
let latestAdvertCreated = 0;

async function init() {
  //   chatIds = await apiService.getChatIds()
  //   chatIds = chatIds.map(chatId => chatId.id)
  const adverts = await apiService.getLatestAdverts();
  latestAdvertCreated = adverts[0].created_at;
}

// bot.onText(/\/subscribe/, async (msg: any, match: any) => {
//   const chatId = msg.chat.id;
//   await apiService.createChatId(chatId);
//   const chatIdsEntity = await apiService.getChatIds();
//   chatIds = chatIdsEntity.map((chatId: any) => chatId.id);
//   bot.sendMessage(chatId, 'You are subscribed for messages');
// });

bot.on('message', (msg: any) => {
  const id = msg.question.split('\n')[0];
  msg.options.forEach(async (option: any) => {
    if (option.voter_count == 1) {
      if (isNaN(Number(option.text))) {
        console.log('update consoleType');
        await apiService.updateAdvertByPk({
          adItemId: id,
          consoleGeneration: option.text,
          status: 'Решение',
        });
      } else {
        console.log('update controllers count');
        await apiService.updateAdvertByPk({
          adItemId: id,
          controllersCount: option.text,
          status: 'Решение',
        });
      }
    }
  });
});

async function poll() {
  while (true) {
    try {
      const adverts = await apiService.getPollingAdverts();
      for (let i = 0; i < adverts.length; i++) {
        await new Promise((r) => setTimeout(r, 1000));
        if (!adverts[i].controllersCount && !adverts[i].consoleGeneration) {
          for (let i = 0; i < chatIds.length; i++) {
            let chatId = chatIds[i];
            await bot.sendMessage(chatId, adverts[i].link);
            await bot.sendPoll(
              chatId,
              `${adverts[i].adItemId}\nСколько контроллеров?`,
              ['0', '1', '2', '3', '4'],
              { allows_multiple_answers: false }
            );
            await bot.sendPoll(
              chatId,
              `${adverts[i].adItemId}\nТип консоли?`,
              ['NOT_PS4', 'FAT500', 'FAT1000', 'SLIM500', 'SLIM1000', 'PRO'],
              { allows_multiple_answers: false }
            );
          }
        } else if (
          !adverts[i].controllersCount &&
          adverts[i].consoleGeneration != 'FAT'
        ) {
          for (let i = 0; i < chatIds.length; i++) {
            let chatId = chatIds[i];
            await bot.sendMessage(chatId, adverts[i].link);
            await bot.sendPoll(
              chatId,
              `${adverts[i].adItemId}\nСколько контроллеров?`,
              ['0', '1', '2', '3'],
              { allows_multiple_answers: false }
            );
          }
        } else if (!adverts[i].consoleGeneration) {
          for (let i = 0; i < chatIds.length; i++) {
            let chatId = chatIds[i];
            await bot.sendMessage(chatId, adverts[i].link);
            await bot.sendPoll(
              chatId,
              `${adverts[i].adItemId}\nТип консоли?`,
              ['FAT', 'SLIM', 'PRO', 'NOT_PS4'],
              { allows_multiple_answers: false }
            );
          }
        }
        await apiService.updateAdvertByPk({
          adItemId: adverts[i].adItemId,
          status: 'На распознавании',
        });
      }
      await apiService.reload();
    } catch (err) {
      console.log(err);
    }
    await new Promise((r) => setTimeout(r, 60000));
  }
}

init();
poll();
