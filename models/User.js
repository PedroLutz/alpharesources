import mongoose from 'mongoose';

delete mongoose.connection.models['User'];

const UserSchema = new mongoose.Schema({
  usuario: String,
  senha: String,
}, { collection: 'users' }); 

const User = mongoose.models['User'] || mongoose.model('User', UserSchema);

export default { User, UserSchema };