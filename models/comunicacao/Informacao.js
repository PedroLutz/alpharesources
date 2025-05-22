import mongoose from 'mongoose';

delete mongoose.connection.models['Informacao'];

const InformacaoSchema = new mongoose.Schema({
  grupo: String,
  stakeholder: String,
  informacao: String, 
  metodo: String,
  frequencia: String,
  canal: String,
  responsavel: String,
  registro: String,
  feedback: String,
  acao: String
}, { collection: 'informacoes' });

const Informacao = mongoose.models['Informacao'] || mongoose.model('Informacao', InformacaoSchema);

export default { Informacao, InformacaoSchema };