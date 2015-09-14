import mongoose from 'mongoose';

var linkSchema = new mongoose.Schema({ 
  source: { type: String, default: null },
  target: String
});

var Link = mongoose.model('Link', linkSchema);

export default Link;
