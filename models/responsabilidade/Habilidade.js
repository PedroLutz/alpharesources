import mongoose from 'mongoose';

delete mongoose.connection.models['Habilidade'];

const HabilidadeSchema = new mongoose.Schema({
  funcao: String,
  area: String,
  item: String,
  habilidade: String,
  nivel_atual: Number,
  nivel_min: Number,
  acao: String
}, { collection: 'habilidades' });
 
const Habilidade = mongoose.models['Habilidade'] || mongoose.model('Habilidade', HabilidadeSchema);

export default { Habilidade, HabilidadeSchema };