import mongoose from 'mongoose';

// Limpe o cache do Mongoose para o modelo 'Person' (se já estiver definido)
delete mongoose.connection.models['Gantt'];

// Defina o modelo 'Person' apenas uma vez com a coleção "financas"
const GanttSchema = new mongoose.Schema({
  codigo: Number,
  plano: Boolean,
  item: String,
  area: String,
  inicio: Date,
  termino: Date,
  dp_item: String,
  dp_area: String,
  status: String
}, { collection: 'gantt' }); // Defina o nome da coleção aqui

export default mongoose.models['Gantt'] || mongoose.model('Gantt', GanttSchema);
