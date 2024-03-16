import mongoose from 'mongoose';

delete mongoose.connection.models['Gantt'];

const GanttSchema = new mongoose.Schema({
  plano: Boolean,
  item: String,
  area: String,
  inicio: Date,
  termino: Date,
  dp_item: String,
  dp_area: String,
  situacao: String,
}, { collection: 'gantt' }); 

export default mongoose.models['Gantt'] || mongoose.model('Gantt', GanttSchema);
