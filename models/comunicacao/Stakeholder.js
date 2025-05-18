import mongoose from 'mongoose';

delete mongoose.connection.models['Stakeholder'];

const StakeholderSchema = new mongoose.Schema({
  grupo: String,
  stakeholder: String,
  influencia: Boolean,
  impacto: Boolean,
  poder: Boolean,
  interesse: Boolean,
  expectativas: String,
  requisitos: String,
  engajamento_positivo: String,
  engajamento_negativo: String
}, { collection: 'stakeholders' });

const Stakeholder = mongoose.models['Stakeholder'] || mongoose.model('Stakeholder', StakeholderSchema);

export default { Stakeholder, StakeholderSchema };