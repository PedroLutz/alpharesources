import mongoose from 'mongoose';

delete mongoose.connection.models['Risco'];

const RiscoSchema = new mongoose.Schema({
  area: String,
  item: String,
  risco: String,
  efeito: String,
  ehNegativo: Boolean,
  causas: String,
  gatilho: String,
  ocorrencia: Number,
  impacto: Number,
  urgencia: Number,
}, { collection: 'riscos' }); 

const Risco = mongoose.models['Risco'] || mongoose.model('Risco', RiscoSchema);

export default { Risco, RiscoSchema };