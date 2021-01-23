FROM node:14.15.4-buster

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm i
COPY . ./
EXPOSE 3000
RUN npm run build
RUN ls && pwd
CMD [ "npm", "start" ]