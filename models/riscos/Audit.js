import mongoose from 'mongoose';

delete mongoose.connection.models['Audit'];

const AuditSchema = new mongoose.Schema({
  risco: String,
  resposta: String,
  impactoFinanceiro: Number,
  descricaoImpacto: String
}, { collection: 'riscoAudit' }); 

const Audit = mongoose.models['Audit'] || mongoose.model('Audit', AuditSchema);

export default { Audit, AuditSchema };