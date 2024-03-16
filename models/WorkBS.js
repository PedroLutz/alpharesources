import mongoose from 'mongoose';

delete mongoose.connection.models['Elemento'];

const workBsSchema = new mongoose.Schema({
  item: String,
  area: String,
}, { collection: 'workbs' });

export default mongoose.models['Elemento'] || mongoose.model('Elemento', workBsSchema);
