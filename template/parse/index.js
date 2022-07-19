// Example express application adding the parse-server module to expose Parse
// compatible API routes.

const express = require('express');
const ParseServer = require('parse-server').ParseServer;
const path = require('path');
const args = process.argv || [];
const test = args.some(arg => arg.includes('jasmine'));
const history = require('connect-history-api-fallback');
const cors = require("cors");

const databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}
const config = {
   // The account lock policy
  accountLockout: {
    // Lock the account for 5 minutes.
    duration: 5,
    // Lock an account after 3 failed log-in attempts
    threshold: 3,
    // Unlock the account after a successful password reset
    unlockOnPasswordReset: true,
  },
  passwordPolicy: {    
    // Enforce a password of at least 8 characters which contain at least 1 lower case, 1 upper case and 1 digit
    validatorPattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/,
    // Do not allow the username as part of the password
    doNotAllowUsername: true,
    // Do not allow to re-use the last 5 passwords when setting a new password
    maxPasswordHistory: 5,
  },
  publicServerURL:process.env.PUBLIC_SERVER_URL,

  databaseURI: databaseUri || `mongodb://localhost:27017/${process.env.APP_ID}`,
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || 'parse',
  masterKey: process.env.MASTER_KEY || 'xxxxxxxxxx', //Add your master key here. Keep it secret!
  serverURL: process.env.SERVER_URL || 'http://46.101.76.255:88/parse', // Don't forget to change to https if needed
emailAdapter: {
    module: "parse-server-generic-email-adapter",
    options: {
       service: "Gmail", // Could be anything like yahoo, hotmail, etc, Full list - see below 
       email: "xxxxxxxxxxxxx",
       password: "xxxxxxxxxxxxx"
    }
 },
  appName:process.env.APP_ID,
  fileKey: process.env.FILE_KEY,
  verifyUserEmails: true,
  emailVerifyTokenValidityDuration: 2 * 60 * 60,
  clientKey:process.env.CLIENT_KEY,
  javaScriptKey:process.env.JAVASCRIPT_KEY,
  liveQuery: {},
};
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

const app = express();
app.use(cors());
app.use(history());

// Serve static assets from the /public folder
app.use('/', express.static(path.join(__dirname, '/public')));

// Serve the Parse API on the /parse URL prefix
const mountPath = process.env.PARSE_MOUNT || '/parse';
if (!test) {
  const api = new ParseServer(config);
  app.use(mountPath, api);
}

// Parse Server plays nicely with the rest of your web routes
app.get('/', function (req, res) {
  res.status(200).send(`Server Is Running`);
});


const port = process.env.PORT || 88;
if (!test) {
  const httpServer = require('http').createServer(app);
  httpServer.listen(port, function () {
    console.log('parse-server-example running on port ' + port + '.');
  });
  // This will enable the Live Query real-time server
  ParseServer.createLiveQueryServer(httpServer);
}

module.exports = {
  app,
  config,
};
