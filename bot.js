import dotenv from 'dotenv';
import TelegramBot from 'node-telegram-bot-api';
import { apiService } from './apiService.js';
import express from 'express';

dotenv.config();
const app = express();

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
let chatIds = [259567367, 348494653, 1629479461, 945138731, 497969967];
let latestAdvertCreated = 0;

async function init() {
  chatIds = await apiService.getChatIds();
  chatIds = chatIds.map((chatId) => chatId.id);
  const adverts = await apiService.getLatestAdverts();
  latestAdvertCreated = adverts[0].created_at;
}

bot.onText(/\/subscribe/, async (msg, match) => {
  const chatId = msg.chat.id;
  await apiService.createChatId(chatId);
  chatIds = await apiService.getChatIds();
  chatIds = chatIds.map((chatId) => chatId.id);
  bot.sendMessage(chatId, 'You are subscribed for messages');
});

bot.on('poll', (msg) => {
  const id = Number(msg.question.split('\n')[0]);
  msg.options.forEach(async (option) => {
    if (option.voter_count == 1) {
      if (typeof id == 'number' && id) {
        const advert = await apiService.getAdvertById(id);
        if (advert.status == 'На распознавании') {
          if (isNaN(Number(option.text))) {
            if (option.text == 'Да') {
              console.log('update status');
              await apiService.updateAdvertByPk({
                adItemId: id,
                status: 'Решение',
              });
            } else {
              console.log('update consoleType');
              await apiService.updateAdvertByPk({
                adItemId: id,
                consoleGeneration: option.text,
              });
            }
          } else {
            console.log('update controllers count');
            await apiService.updateAdvertByPk({
              adItemId: id,
              controllersCount: option.text,
            });
          }
        }
      } else {
        console.log(msg.id);
        // chatIds.forEach(async (chatId) => {
        //   // delete poll
        //   await bot.deleteMessage(chatId, msg.id);
        // });
      }
    }
  });
});

// async function sendTestMessage() {
//   chatIds.forEach(async (chatId) => {
//     await bot.sendMessage(chatId, 'test message');
//     await bot.sendPoll(chatId, `Test question`, ['0', '1', '2', '3', '4'], {
//       allows_multiple_answers: false,
//     });
//     await bot.sendPoll(chatId, `Test question 2`, ['0', '1', '2', '3', '4'], {
//       allows_multiple_answers: false,
//     });
//   });

//   return;
// }

async function poll() {
  try {
    const adverts = await apiService.getPollingAdverts();
    for (let i = 0; i < adverts.length; i++) {
      await new Promise((r) => setTimeout(r, 1000));
      chatIds.forEach(async (chatId) => {
        await bot.sendMessage(chatId, adverts[i].link);
        const textForGeneration = adverts[i].consoleGenerationRecognizer
          ? `${adverts[i].adItemId}\nСейчас выбрано: ===${adverts[i].consoleGenerationRecognizer}===\nТип консоли?`
          : `${adverts[i].adItemId}\nТип консоли?`;
        const textForControllers = adverts[i].controllersCount
          ? `${adverts[i].adItemId}\nСейчас выбрано: ===${adverts[i].controllersCount}===\nСколько контроллеров?`
          : `${adverts[i].adItemId}\nСколько контроллеров?`;
        await bot.sendPoll(
          chatId,
          textForGeneration,
          ['NOT_PS4', 'FAT500', 'FAT1000', 'SLIM500', 'SLIM1000', 'PRO'],
          { allows_multiple_answers: false }
        );
        await bot.sendPoll(
          chatId,
          textForControllers,
          ['0', '1', '2', '3', '4'],
          { allows_multiple_answers: false }
        );
        await bot.sendPoll(
          chatId,
          `${adverts[i].adItemId}\nВсе ли правильно?`,
          ['Да', 'Нет']
        );
      });
      await apiService.updateAdvertByPk({
        adItemId: adverts[i].adItemId,
        status: 'На распознавании',
      });
    }
    await apiService.reload();
  } catch (err) {
    console.log(err);
  }
}

async function runInCycle() {
  await init();
  // await sendTestMessage();
  while (true) {
    await poll();
    await new Promise((r) => setTimeout(r, 5 * 60 * 1000));
  }
}

async function run() {
  const port = 4000;

  app.get('/', async (req, res) => {
    res.send('Hello World!');
  });

  app.listen(port, async () => {
    console.log(`Example app listening on port ${port}`);
    await runInCycle();
  });
}

run();
