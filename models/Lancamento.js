// models/Person.js
import mongoose from 'mongoose';

// Limpe o cache do Mongoose para o modelo 'Person' (se já estiver definido)
delete mongoose.connection.models['Lancamento'];

// Defina o modelo 'Person' apenas uma vez com a coleção "financas"
const lancamentoSchema = new mongoose.Schema({
  tipo: String,
  descricao: String,
  valor: Number,
  data: Date,
  area: String,
  origem: String,
  destino: String,
}, { collection: 'financas' }); // Defina o nome da coleção aqui

export default mongoose.models['Lancamento'] || mongoose.model('Lancamento', lancamentoSchema);
