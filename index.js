const prerenderMiddleware = require('prerender-node');
const express = require('express');

const PORT = 8000;
const app = express();

/*
 * Make sure you attach the prerender middleware earlier than any other
 * middleware that you want prerendered (e.g. static).
 */
app.use(prerenderMiddleware.set('prerenderServiceUrl', 'http://localhost:3000'));

/**
 * Now that you have the Prerender middleware attached, attach any other middlewares in the
 * desired order to make sure they can be prerendered.
 */
app.use(express.static('public'));

/**
 * Start the Express.js server.
 */
app.listen(PORT, () => {
  console.log(`Prerender Vue.js example app is listening at http://localhost:${PORT}`);
});

