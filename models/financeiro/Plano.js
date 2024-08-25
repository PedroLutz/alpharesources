import mongoose from 'mongoose';

delete mongoose.connection.models['Plano'];

const PlanoSchema = new mongoose.Schema({
  plano: String,
  area: String,
  item: String,
  recurso: String,
  uso: String,
  tipo_a: String,
  valor_a: Number,
  plano_a: String,
  data_inicial: Date,
  data_esperada: Date,
  data_limite: Date,
  plano_b: String,
  tipo_b: String,
  valor_b: Number,
  plano_real: String,
  valor_real: String,
  data_real: String
}, { collection: 'planos' });

const Plano = mongoose.models['Plano'] || mongoose.model('Plano', PlanoSchema);

export default {Plano, PlanoSchema}; 