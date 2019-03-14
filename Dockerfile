FROM node:9-slim
WORKDIR /app
COPY package.json ./app
RUN npm install
COPY ./src /app
COPY . /app
CMD ["npm", "run", "broker"]