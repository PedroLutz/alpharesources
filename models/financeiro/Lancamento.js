import mongoose from 'mongoose';

delete mongoose.connection.models['Lancamento'];

const lancamentoSchema = new mongoose.Schema({
  tipo: String,
  descricao: String,
  valor: Number,
  data: Date,
  area: String,
  origem: String,
  destino: String,
}, { collection: 'financas' }); 

export default mongoose.models['Lancamento'] || mongoose.model('Lancamento', lancamentoSchema);
