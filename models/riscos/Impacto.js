import mongoose from 'mongoose';

delete mongoose.connection.models['Impacto'];

const ImpactoSchema = new mongoose.Schema({
  risco: String,
  areaImpacto: String,
  valor: Number,
  descricao: String
}, { collection: 'riscoImpacto' }); 

const Impacto = mongoose.models['Impacto'] || mongoose.model('Impacto', ImpactoSchema);

export default { Impacto, ImpactoSchema };