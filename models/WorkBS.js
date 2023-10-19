import mongoose from 'mongoose';

// Limpe o cache do Mongoose para o modelo 'Person' (se já estiver definido)
delete mongoose.connection.models['WorkBS'];

// Defina o modelo 'Person' apenas uma vez com a coleção "financas"
const workBsSchema = new mongoose.Schema({
  codigo: Number,
  item: String,
  area: String,
}, { collection: 'workbs' }); // Defina o nome da coleção aqui

export default mongoose.models['WorkBS'] || mongoose.model('WorkBS', workBsSchema);
