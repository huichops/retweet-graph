'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _configTwitterCredentialsJson = require('../config/TwitterCredentials.json');

var _configTwitterCredentialsJson2 = _interopRequireDefault(_configTwitterCredentialsJson);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _modelsTweet = require('./models/Tweet');

var _modelsTweet2 = _interopRequireDefault(_modelsTweet);

var _modelsUser = require('./models/User');

var _modelsUser2 = _interopRequireDefault(_modelsUser);

var _twitter = require('twitter');

var _twitter2 = _interopRequireDefault(_twitter);

var _socketIo = require('socket.io');

var _socketIo2 = _interopRequireDefault(_socketIo);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _q = require('q');

var _q2 = _interopRequireDefault(_q);

var PORT = 8080;
var id = '640305644193599488';

var client = new _twitter2['default'](_configTwitterCredentialsJson2['default']);
var app = _http2['default'].createServer();
var socket = (0, _socketIo2['default'])(app);

_mongoose2['default'].connect('mongodb://localhost/test');
app.listen(PORT, function () {
  return console.log('Listening on: ' + PORT);
});

getTweet(id).then(function (tweet) {
  client.stream('statuses/filter', { follow: tweet.user.id_str }, function (stream) {
    stream.on('data', function (tweet) {

      var toSend = {
        text: tweet.text,
        id: tweet.id,
        favorite_count: tweet.favorite_count
      };
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
  var deferred = _q2['default'].defer();
  client.get('statuses/show', { id: id }, function (err, tweet, response) {
    if (err) deferred.reject(err);
    console.log('Got tweet: ' + tweet.text);
    deferred.resolve(tweet);
  });
  return deferred.promise;
}