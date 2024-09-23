import mongoose from 'mongoose';

delete mongoose.connection.models['Resposta'];

const RespostaSchema = new mongoose.Schema({
  risco: String,
  estrategia: String,
  detalhamento: String
}, { collection: 'riscoRespostas' }); 

const Resposta = mongoose.models['Resposta'] || mongoose.model('Resposta', RespostaSchema);

export default { Resposta, RespostaSchema };