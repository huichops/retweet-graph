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

var _q = require('q');

var _q2 = _interopRequireDefault(_q);

_mongoose2['default'].connect('mongodb://localhost/test');

var client = new _twitter2['default'](_configTwitterCredentialsJson2['default']);
var friends = [];
var id = '641354193773576192';

_modelsTweet2['default'].remove({}, function (err) {
  console.log('dropped tweets!');
});

getTweet(id).then(getRetweets).then(function (res) {
  res.forEach(function (tweet) {
    console.log(tweet.id);
    _modelsTweet2['default'].create({ text: tweet.text });
    _modelsUser2['default'].create(tweet.user);
  });
});

function getTweet(id) {
  var deferred = _q2['default'].defer();
  client.get('statuses/show', { id: id }, function (err, tweet, response) {
    if (err) deferred.reject(err);
    deferred.resolve(tweet);
  });
  return deferred.promise;
}

function getRetweets(tweet) {
  var deferred = _q2['default'].defer();
  client.get('statuses/retweets', { id: tweet.id_str }, function (err, tweets, response) {
    if (err) deferred.reject(err);
    deferred.resolve(tweets);
  });
  return deferred.promise;
}

function saveUsers() {}

function checkFollowers() {}