import mongoose from 'mongoose';

// Limpe o cache do Mongoose para o modelo 'Person' (se já estiver definido)
delete mongoose.connection.models['Raci'];

// Defina o modelo 'Person' apenas uma vez com a coleção "financas"
const raciSchema = new mongoose.Schema({
  area: String,
  item: String,
  responsabilidades: String
}, { collection: 'raci' }); // Defina o nome da coleção aqui

export default mongoose.models['Raci'] || mongoose.model('Raci', raciSchema);
