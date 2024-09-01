import mongoose from 'mongoose';

delete mongoose.connection.models['InfoComunicada'];

const InfoComunicadaSchema = new mongoose.Schema({
  stakeholder: String,
  informacao: String,
  timing: String,
  check: Boolean
}, { collection: 'infoComunicada' }); 

const InfoComunicada = mongoose.models['InfoComunicada'] || mongoose.model('InfoComunicada', InfoComunicadaSchema);

export default { InfoComunicada, InfoComunicadaSchema };