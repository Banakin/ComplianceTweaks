FROM node:14.15.4-buster

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --only=production
COPY . ./
EXPOSE 3000
RUN npm run build
CMD [ "npm", "start" ]