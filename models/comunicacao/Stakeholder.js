import mongoose from 'mongoose';

delete mongoose.connection.models['Stakeholder'];

const StakeholderSchema = new mongoose.Schema({
  name: String,
  involvement: String,
  influence: String,
  power: Boolean,
  interest: Boolean,
  expectations: String,
  requisites: String,
  information: String,
  method: String,
  tools: String,
  responsible: String
}, { collection: 'stakeholders' }); 

const Stakeholder = mongoose.models['Stakeholder'] || mongoose.model('Stakeholder', StakeholderSchema);

export default { Stakeholder, StakeholderSchema };