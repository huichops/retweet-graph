import mongoose from 'mongoose';

var tweetSchema = new mongoose.Schema({
  text: String,
  created: Date,
  user_name: String

});

var Tweet = mongoose.model('Tweet', tweetSchema);

export default Tweet;
