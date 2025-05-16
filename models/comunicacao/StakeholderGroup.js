import mongoose from 'mongoose';

delete mongoose.connection.models['StakeholderGroup'];

const StakeholderGroupSchema = new mongoose.Schema({
  grupo: String,
  envolvimento: String,
  influencia: String,
  impacto: String,
  poder: String,
  interesse: String,
  expectativas: String,
  requisitos: String,
  engajamento_positivo: String,
  engajamento_negativo: String
}, { collection: 'stakeholderGroups' });

const StakeholderGroup = mongoose.models['StakeholderGroup'] || mongoose.model('StakeholderGroup', StakeholderGroupSchema);

export default { StakeholderGroup, StakeholderGroupSchema };