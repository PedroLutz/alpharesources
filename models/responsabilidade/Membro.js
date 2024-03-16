import mongoose from 'mongoose';

delete mongoose.connection.models['Membro'];

const membroSchema = new mongoose.Schema({
  nome: String,
  softskills: String,
  hardskills: String
}, { collection: 'membros' });

export default mongoose.models['Membro'] || mongoose.model('Membro', membroSchema);
