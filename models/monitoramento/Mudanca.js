import mongoose from 'mongoose';

delete mongoose.connection.models['Mudanca'];

const MudancaSchema = new mongoose.Schema({
  data: Date,
  area: String,
  tipo: String,
  item_config: String,
  mudanca: String,
  justificativa: String,
  impacto: String,
  aprovado: Boolean,
  status: String,
  responsavel_solicitacao: String,
  responsavel_aprovacao: String
}, { collection: 'mudancas' }); 

const Mudanca = mongoose.models['Mudanca'] || mongoose.model('Mudanca', MudancaSchema); 

export default {Mudanca, MudancaSchema};