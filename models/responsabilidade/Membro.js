import mongoose from 'mongoose';

// Limpe o cache do Mongoose para o modelo 'Person' (se já estiver definido)
delete mongoose.connection.models['Membro'];

// Defina o modelo 'Person' apenas uma vez com a coleção "financas"
const membroSchema = new mongoose.Schema({
  nome: String,
  softskills: String,
  hardskills: String
}, { collection: 'membros' }); // Defina o nome da coleção aqui

export default mongoose.models['Membro'] || mongoose.model('Membro', membroSchema);
