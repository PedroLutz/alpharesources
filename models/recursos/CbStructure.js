import mongoose from 'mongoose';

delete mongoose.connection.models['Cbs'];

const CbsSchema = new mongoose.Schema({
    codigo: String,
    area: String,
    item: String,
    custo_ideal: Number,
    custo_essencial: Number,
    custo_real: Number
}, { collection: 'cbs' });

const Cbs = mongoose.models['Cbs'] || mongoose.model('Cbs', CbsSchema);

export default {Cbs, CbsSchema}; 