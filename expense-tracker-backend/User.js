import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name:{type:String,required:true},
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, { collection: 'Users' }); 

export default mongoose.model('User', userSchema); // Model name can be singular