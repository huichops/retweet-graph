import credentials from '../config/TwitterCredentials.json';
import mongoose from 'mongoose';
import Tweet from './models/Tweet';
import User from './models/User';
import Twitter from 'twitter';
import io from 'socket.io';
import http from 'http';
import Q from 'q';


const PORT = 8080;
const id = '640305644193599488';

var client = new Twitter(credentials);
var app = http.createServer();
var socket = io(app);

mongoose.connect('mongodb://localhost/test');
app.listen(PORT, () => console.log(`Listening on: ${PORT}`));

getTweet(id)
.then(function(tweet) {
  client.stream('statuses/filter', { follow: tweet.user.id_str }, function(stream) {
    stream.on('data', function(tweet) {

      var toSend = {
        text: tweet.text,
        id: tweet.id,
        favorite_count: tweet.favorite_count
      }
      console.log(toSend);
      if (tweet.retweeted_status) {
        if (tweet.retweeted_status.id_str === id) {
          socket.emit('tweet', toSend);
        }
      }

    });
  });
});


function getTweet(id) {
  var deferred = Q.defer();
  client.get('statuses/show', {id}, (err, tweet, response) => {
    if (err) deferred.reject(err);
    console.log(`Got tweet: ${tweet.text}`);
    deferred.resolve(tweet);
  });
  return deferred.promise;
}
