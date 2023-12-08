import mongoose from 'mongoose';

// Limpe o cache do Mongoose para o modelo 'Person' (se já estiver definido)
delete mongoose.connection.models['User'];

// Defina o modelo 'Person' apenas uma vez com a coleção "financas"
const UserSchema = new mongoose.Schema({
  usuario: String,
  senha: String,
}, { collection: 'users' }); // Defina o nome da coleção aqui

export default mongoose.models['User'] || mongoose.model('User', UserSchema);
