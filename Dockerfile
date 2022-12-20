FROM --platform=linux/amd64 node:14-alpine

WORKDIR /home/node/app
COPY package*.json ./
COPY tsconfig.json ./

COPY src /home/node/app/src
RUN ls -a
RUN npm install
RUN npm run build

ENV NODE_ENV=production
EXPOSE 3000

CMD [ "node", "./dist/index.js" ]