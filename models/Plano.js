// models/Person.js
import mongoose from 'mongoose';

// Limpe o cache do Mongoose para o modelo 'Person' (se já estiver definido)
delete mongoose.connection.models['Plano'];

// Defina o modelo 'Person' apenas uma vez com a coleção "financas"
const planoSchema = new mongoose.Schema({
  plano: String,
  area: String,
  recurso: String,
  tipo_a: String,
  valor_a: Number,
  plano_a: String,
  data_esperada: Date,
  data_limite: Date,
  plano_b: String,
  tipo_b: String,
  valor_b: Number
}, { collection: 'financas' }); // Defina o nome da coleção aqui

export default mongoose.models['Plano'] || mongoose.model('Plano', planoSchema);
