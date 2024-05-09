import mongoose from 'mongoose';

delete mongoose.connection.models['Wbs'];

const WbsSchema = new mongoose.Schema({
  item: String,
  area: String,
}, { collection: 'workbs' });

const Wbs = mongoose.models['Wbs'] || mongoose.model('Wbs', WbsSchema);
export default { Wbs , WbsSchema };