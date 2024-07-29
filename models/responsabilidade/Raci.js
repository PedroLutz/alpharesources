import mongoose from 'mongoose';

// Limpe o cache do Mongoose para o modelo 'Person' (se já estiver definido)
delete mongoose.connection.models['Raci'];

// Defina o modelo 'Person' apenas uma vez com a coleção "financas"
const RaciSchema = new mongoose.Schema({
  area: String,
  item: String,
  responsabilidades: String
}, { collection: 'raci' }); 


const Raci = mongoose.models['Raci'] || mongoose.model('Raci', RaciSchema);

export default {Raci , RaciSchema};