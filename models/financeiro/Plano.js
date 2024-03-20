import mongoose from 'mongoose';

delete mongoose.connection.models['Plano'];

const planoSchema = new mongoose.Schema({
  plano: String,
  area: String,
  item: String,
  recurso: String,
  uso: String,
  tipo_a: String,
  valor_a: Number,
  plano_a: String,
  data_esperada: Date,
  data_limite: Date,
  plano_b: String,
  tipo_b: String,
  valor_b: Number
}, { collection: 'planos' });

export default mongoose.models['Plano'] || mongoose.model('Plano', planoSchema);
