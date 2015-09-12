import mongoose from 'mongoose';

var userSchema = new mongoose.Schema({ 
  screen_name: String,
  created: Date

});

var User = mongoose.model('User', userSchema);

export default User;
