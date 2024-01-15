FROM node:18
WORKDIR /
COPY . .
CMD ["node", "bot.js"]
RUN npm run start