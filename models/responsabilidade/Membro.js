import mongoose from 'mongoose';

delete mongoose.connection.models['Membro'];

const MembroSchema = new mongoose.Schema({
  nome: String,
  softskills: String,
  hardskills: String
}, { collection: 'membros' });
 
const Membro = mongoose.models['Membro'] || mongoose.model('Membro', MembroSchema);

export default { Membro, MembroSchema };