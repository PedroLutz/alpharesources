import mongoose from 'mongoose';

delete mongoose.connection.models['Funcao'];

const FuncaoSchema = new mongoose.Schema({
  funcao: String,
  descricao: String,
  habilidades: String,
  responsavel: String,
  area: String,
  itens: String
}, { collection: 'funcoes' });
 
const Funcao = mongoose.models['Funcao'] || mongoose.model('Funcao', FuncaoSchema);

export default { Funcao, FuncaoSchema };