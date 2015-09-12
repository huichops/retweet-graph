'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var userSchema = new _mongoose2['default'].Schema({
  screen_name: String,
  created: Date

});

var User = _mongoose2['default'].model('User', userSchema);

exports['default'] = User;
module.exports = exports['default'];