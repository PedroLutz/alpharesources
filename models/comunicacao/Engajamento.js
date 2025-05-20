import mongoose from 'mongoose';

delete mongoose.connection.models['Engajamento'];

const EngajamentoSchema = new mongoose.Schema({
    grupo: String,
    stakeholder: String,
    poder: Boolean,
    interesse: Boolean,
    nivel_engajamento: String,
    nivel_eng_desejado: String
}, { collection: 'sh_engajamento' });

const Engajamento = mongoose.models['Engajamento'] || mongoose.model('Engajamento', EngajamentoSchema);

export default { Engajamento, EngajamentoSchema };