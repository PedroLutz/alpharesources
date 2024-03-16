import mongoose from 'mongoose';

delete mongoose.connection.models['User'];

const UserSchema = new mongoose.Schema({
  usuario: String,
  senha: String,
}, { collection: 'users' }); 

export default mongoose.models['User'] || mongoose.model('User', UserSchema);
