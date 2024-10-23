FROM node:18-alpine

WORKDIR /usr/src/index

COPY . .

RUN npm i 

RUN npm run build 

EXPOSE 4000

CMD [ "npm" , "run" , "start" ]