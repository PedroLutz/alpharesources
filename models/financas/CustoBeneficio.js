import mongoose from 'mongoose';

delete mongoose.connection.models['CustoBeneficio'];

const CustoBeneficioSchema = new mongoose.Schema({
  identificacao: String,
  descricao: String,
  custo: Number,
  escala_custo: Number,
  impacto: Number,
  urgencia: Number,
  diferencial: Number,
  areas_afetadas: Number,
  explicacao: String
}, { collection: 'custoBeneficio' }); 

const CustoBeneficio = mongoose.models['CustoBeneficio'] || mongoose.model('CustoBeneficio', CustoBeneficioSchema); 

export default {CustoBeneficio, CustoBeneficioSchema};
