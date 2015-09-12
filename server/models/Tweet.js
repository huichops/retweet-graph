'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var tweetSchema = new _mongoose2['default'].Schema({
  text: String,
  created: Date,
  user_name: String

});

var Tweet = _mongoose2['default'].model('Tweet', tweetSchema);

exports['default'] = Tweet;
module.exports = exports['default'];