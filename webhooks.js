import WebhooksApi from '@octokit/webhooks';
import octokitLib from '@octokit/rest';
import fetch from 'node-fetch';

import pullRequestHandler from './pull_request';

const WEBHOOK_SECRET = process.env['WEBHOOK_SECRET'];
const GITHUB_TOKEN = process.env['GITHUB_TOKEN'];

const webhooks = new WebhooksApi({
  secret: WEBHOOK_SECRET || 'mysecret'
});

const octokit = octokitLib();

octokit.authenticate({
  type: 'token',
  token: GITHUB_TOKEN
});

// a new pull request event
webhooks.on('pull_request', pullRequestHandler(octokit));

webhooks.on('error', (error) => {
  console.log(`Error occured in "${error.event.name} handler: ${error.stack}"`);
});


module.exports = (req, res) => {
  // put this inside your webhooks route handler
  webhooks.verifyAndReceive({
    id: req.headers['x-github-delivery'],
    name: req.headers['x-github-event'],
    payload: req.body,
    signature: req.headers['x-hub-signature']
  }).catch(console.error);
};


// // uncomment and do node index.js for local development
// import EventSource from 'eventsource';
// const webhookProxyUrl = 'https://smee.io/JBPDF4Rxfx5K01x';
// const source = new EventSource(webhookProxyUrl);
// source.onmessage = (event) => {
//   const webhookEvent = JSON.parse(event.data);
//   webhooks.verifyAndReceive({
//     id: webhookEvent['x-request-id'],
//     name: webhookEvent['x-github-event'],
//     signature: webhookEvent['x-hub-signature'],
//     payload: webhookEvent.body
//   }).catch(console.error);
// };