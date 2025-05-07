import mongoose from 'mongoose';

delete mongoose.connection.models['Analise'];

const AnaliseSchema = new mongoose.Schema({
  risco: String,
  ocorrencia: Number,
  impacto: Number,
  acao: Number,
  urgencia: Number,
  impactoFinanceiro: Number,
  impactoCronograma: Number
}, { collection: 'riscoAnalise' }); 

const Analise = mongoose.models['Analise'] || mongoose.model('Analise', AnaliseSchema);

export default { Analise, AnaliseSchema };