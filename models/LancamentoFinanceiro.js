import mongoose from 'mongoose';

delete mongoose.connection.models['Lancamento'];

const LancamentoSchema = new mongoose.Schema({
  tipo: String,
  descricao: String,
  valor: Number,
  data: Date,
  area: String,
  origem: String,
  destino: String,
  deletado: Boolean
}, { collection: 'financas' }); 

const Lancamento = mongoose.models['Lancamento'] || mongoose.model('Lancamento', LancamentoSchema); 

export default {Lancamento, LancamentoSchema};
