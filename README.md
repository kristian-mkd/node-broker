# The node.js message broker app (WIP)

Message broker application that allows multiple appplication to publish and subscribe messages to the main broker.

## Steps for startup of the apps

To start the broker app, run the following in separate terminals

```bash
npm run broker
npm run firstProducer
npm run firstConsumer
```

For development
```bash
tsc -w
docker build -t node-broker .
docker build -t node-first-consumer -f ./consumer/Dockerfile .
docker run -it -p 3000:3000 node-broker
```

## Used technologies
* node.js
* express.js
* typescript
* postgre
* docker
* written on: VS Code
* published on: GitHub

Made with ❤️ by Kristian
