# Creating an Express.js app with Vue.js and Prerender.io.

JavaScript frameworks such as Vue.js or React are great for developing dynamic web applications, but when it comes to SEO, they all face the same problem:

> Bots - such as Google bot - crawling the web don't deal with rendering JavaScript, because it's an expensive operation, so your site loses most (if not all) of its content.

To let search engines and social network bots properly fetch our content, we need to prerender our JavaScript site for them, so then they can parse and index the same content our users would normally see.

> Prerender is just the right tool for this.

Let's start with a very basic [Vue.js](https://vuejs.org/) application. The code is far from a production-ready app, of course: the goal is to demonstrate how prerendering JavaScript SPAs (Single Page Applications) work.

## Here is how to run the example:

> This example uses the self-hosted open-source Prerender server available here: [GitHub](https://github.com/prerender/prerender). This version is perfectly suitable for development, but for production applications I suggest you using the cloud service of Prerender.io with high availability, advanced caching and a virtual stamp directly from [Google](https://developers.google.com/search/docs/guides/dynamic-rendering#implement).

### Launch Prerender:

```sh
git clone https://github.com/prerender/prerender.git
cd prerender
npm install
npm start
```
Prerender will start at `http://locahost:3000` by default. If you want to change that, set the `PORT` environment variable as desirred before launching it.

### Launch the example

```sh
git clone https://github.com/prerender/prerender-vue-example.git
cd prerender-vue-example
npm install
npm start
```

### Test the page and compare raw vs prerendered content

We'll use `curl` to see the raw content that bots see. Issue the following command:

```sh
curl http://localhost:8000
```

You see that the `user` variable is not filled, because that is supposed to be rendered by the browser when it executes our JavaScript code.

```html
<!DOCTYPE html>
<html>
<head>
  <base href="/" />
  <title>Prerender.io Vue.js Example</title>
  <script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>
</head>
<body>
  <div id="app">
    Logged in user is: {{ user }}
  </div>

  <script>
    const app = new Vue({
      el: '#app',
      data: {
        user: 'John Doe'
      }
    })
  </script>
</body>
</html>
```

When a crawler bot visits our page that is not prerendered, it'll just see

```
Logged in user is: {{ user }}
```

which is not what we want. But luckily our application is prepared to be prerendered, so let's see what happens then! Let's change the user agent to `googlebot`, so then our Prerender middleware thinks that Google is fetching our page:

```sh
curl -A "googlebot" http://localhost:8000
```

And the result is:

```html
<!DOCTYPE html><html><head>
  <base href="/">
  <title>Prerender.io Vue.js Example</title>
</head>
<body>
  <div id="app">
    Logged in user is: John Doe
  </div>
</body>
</html>
```

Now we have the user properly rendered, and the `script` tag that was supposed to run our application logic is gone. This is now just perfect for Google or Facebook to fetch and index.

## Take a look at the code

Going through the code base we find the following files:
- `public/index.html`: Main page for the app, contains a very basic Vue.js SPA.

```html
<!DOCTYPE html>
<html>
<head>
  <base href="/" />
  <title>Prerender.io Vue.js Example</title>
  <script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>
</head>
<body>
  <div id="app">
    Logged in user is: {{ user }}
  </div>

  <script>
    /*
     * Creates a basic Vue application and makes the page render the
     * logged in user, that we normally fetch from the backend,
     * but we didn't want to overcomplicate the code.
     */
    const app = new Vue({
      el: '#app',
      data: {
        user: 'John Doe'
      }
    })
  </script>
</body>
</html>
```

- `index.js`: Server side code to launch. It will start an Express server and host our static files.

```javascript
const express = require('express');
const prerenderMiddleware = require('prerender-node');

const PORT = 8000;
const app = express();

/*
 * Make sure you attach the prerender middleware earlier than any other
 * middleware that you want prerendered (e.g. static).
 */
app.use(prerenderMiddleware
  /*
   * You can set the target server with the prerenderServiceUrl param to point
   * this middleware to your local Prerender instance. You won't need this
   * setting in production, as you'll use the cloud hosted service.
   */
  .set('prerenderServiceUrl', 'http://localhost:3000'));

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
```

_Happy prerendering!_
