import mongoose from 'mongoose';

delete mongoose.connection.models['Risco'];

const RiscoSchema = new mongoose.Schema({
  area: String,
  item: String,
  risco: String,
  classificacao: String,
  ehNegativo: Boolean,
  efeito: String,
  causa: String,
  gatilho: String
}, { collection: 'riscos' }); 

const Risco = mongoose.models['Risco'] || mongoose.model('Risco', RiscoSchema);

export default { Risco, RiscoSchema };