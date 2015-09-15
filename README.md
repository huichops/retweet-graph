# Retweeters Graph
Generates the propagation graph for the retweets of a tweet by checking all the retweeter users

## Dependencies
#### Made with:
- Gulp
- D3.js
- node-twitter
- Socket.io
- Q
- mongoDB
- And ♥

## About this

Twitter's REST API doesn't provides the data of the path a retweet followed to reach each of its retweeters. So that we need to do a deep search in all the followers of the User that created the original Tweet to build this graph.

This can take SEVERAL minutes depending on the number of followers of eac Retweeter and how deep the following chain is.

## Usage

1. First clone this package `git clone https://github.com/huichops/retweet-graph`
2. Install dependencies with `npm install`
3. Fill the *config/TwitterCredentials.json* file with your own credentials.
3. Start server with `gulp serve`

## Explanation
Twitter's REST API doesn't track who retweeted a certain Tweet. We can construct this graph by doing a breadth-first search on the followers of the User who created a Tweet and the users that retweeted it until we find who is following who. 

Anyway, this can not give us a certain answert about from where the retweet came, because is impossible to know if the User who retweeted the actual Tweet did it from an User He/She is following or found it from another source.

Opposite to the Node.js nature, we need to get the followers synchronously because we are caching the followers of each user in case they don't exist, if we find this before finishing checking all of the followers of each User we will do redundant requests to the Twitter's API, and since we have limitations we don't want that.

## Issues

Sometimes the code stops in the middle of the request, and you have to ask for the graph generation again. If this happens while requesting all the followers of a certain User, you will have to remove all the Links from the mongoDB collection aswell.

This code needs a lot of refactoring, because it's good resource for learning about the Twitter's API limitations, so that, the code
should be cleaner to help the understanding of this problem. Currently is sort of spaghetti code :p

