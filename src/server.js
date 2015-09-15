import mongoose from 'mongoose';
import io from 'socket.io';
import http from 'http';
import Q from 'q';
import async from 'async';

import client from './twitterClient';
import Link from './models/Link';
import api from './api';

// CocoaLoveConf
const user_id = '94179346';
const PORT = 8080;

var app = http.createServer();
var socket_io = io(app);

var connected = [];
var unconnected = {};

var nodes = [];
var links = [];


mongoose.connect('mongodb://localhost/test');
app.listen(PORT, () => console.log(`Listening on: ${PORT}`));

socket_io.on('connection', (socket) => { 
  socket.on('getGraph', (id) => { 
    reset();

    console.log('Generating graph for:', id);
    tweetUser(id)
      .then(getRetweets)
      .then(handleRetweeters, console.err);
  });
});

function reset() {
  connected = [];
  unconnected = {};

  nodes = [];
  links = [];
}

function handleRetweeters(retweets) {
  console.log('Retweeters are:');
  retweets.forEach((retweet) => {
    console.log('--', retweet.user.screen_name);
    unconnected[retweet.user.screen_name] = retweet.user;
  });

  async.whilst(
    () => { 
      console.log(connected.length);
      return connected.length !== 0; 
    },
    (whileCallback) => {
      let source = connected.shift();
      console.log('--source', source.screen_name);
      async.forEachOfSeries(unconnected, (retweeter, key, callback) => {

        isFollower(source, retweeter).then((following) => {
          if (following) {
            console.log(retweeter.screen_name, '--->', source.screen_name);
            connected.push(retweeter);
            addToGraph(source, retweeter);
            delete unconnected[key];
          } else {
            console.log(retweeter.screen_name, '-/->', source.screen_name);
          }
          callback();

        });
      }, () => {
        whileCallback();
      });
    },
    () => {
      console.log('Adding unconnected nodes');
      async.forEachOfSeries(unconnected, (retweeter, key, callback) => {
        addToGraph(null, retweeter);
        callback();
      }, ()=> socket_io.emit('graph', {nodes, links}));
      console.log('Finished all users!!!');
      
    });
}
function nodeIndex(user) {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].screen_name == user.screen_name) return i;
  }
  return -1;
}

function addToGraph(followed, follower) {
  nodes.push({
    id: follower.id,
    screen_name: follower.screen_name,
    description: follower.description,
    avatar: follower.profile_image_url,
    fill_color: follower.profile_background_color,
    followers_count: follower.followers_count
  });
  if (followed) {
    links.push({ 
      source: nodeIndex(follower),
      target: nodeIndex(followed)
    });
  }
}

function getRetweets(tweet) {
  var deferred = Q.defer();

  client.get('statuses/retweets', {id: tweet.id_str}, (err, retweets) => {
    if (err) {
      deferred.reject(err);
    }
    deferred.resolve(retweets);
  });

  return deferred.promise;
}

function tweetUser(id) {
  var deferred = Q.defer();
  client.get('statuses/show',{id}, (err, tweet) => {
    if (err) {
      console.log(err);
      deferred.reject(err);
    } else {
      console.log('Tweet user is: ', tweet.user.screen_name);
      addToGraph(null, tweet.user);
      connected.push(tweet.user);
    }

    deferred.resolve(tweet);
  });

  return deferred.promise;
}


function isFollower(source, target) {
  var deferred = Q.defer();
  Link.findOne({ source: source.screen_name }, (err, link) => {
    if (err) deferred.reject(err);
    if (!link) {
      findFollowers(source)
        .then(() => {
          Link.findOne({ source: source.screen_name, target: target.screen_name }, (err, link) => {
            deferred.resolve(!!link);
          });
        });
    } else {
      Link.findOne({ source: source.screen_name, target: target.screen_name }, (err, link) => {
        deferred.resolve(!!link);
      });
    }
  }); 
  return deferred.promise;
}

function findFollowers(user) {
  var deferred = Q.defer();
  var cursor = -1;
  var params = {
    skip_status: true,
    count: 200,
    screen_name: user.screen_name,
    cursor
  };
  var users = [];
  console.log(user.screen_name);
  client.get('followers/list', params, function next(err, data, res) {
    params.cursor = cursor;
    if (err) {
      console.log(err);
      if (err[0].code == 88) {
        api.limitStatus('followers', 'list')
          .then((rate) => {
            var remaining = ((rate.reset * 1000) - Date.now()) + 1000;
            console.log('Restarting in', remaining / 1000, 'seconds');
            console.log('Which is', new Date(rate.reset * 1000).toTimeString());
            console.log('Cursor is at', cursor);
            console.log('Current followers harvested', users.length);

            setTimeout(() => {
              client.get('followers/list', params, next);
            }, remaining);
          });
      } else {
        console.log('Unexpected stop retrying...');
        setTimeout(() => {
          client.get('followers/list', params, next);
        }, 500);
      }
    } else {
      data.users.forEach((follower)=>{
        let link = new Link({ source: user.screen_name, target: follower.screen_name  });
        link.save((err, link) => {
          console.log('Saved link', user.screen_name, '-->', follower.screen_name); 
        });
        users.push(follower.screen_name);
      });
      if (data.next_cursor != 0) {
        cursor = data.next_cursor;
        params.cursor = cursor;
        console.log(data.next_cursor);
        setTimeout(() => {
          client.get('followers/list', params, next);
        }, 500);
      } else {
        deferred.resolve(users);
      }
    }
  });
  return deferred.promise;
  console.log(source.screen_name, target.screen_name);
}
