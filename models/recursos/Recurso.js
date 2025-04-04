import mongoose from 'mongoose';

delete mongoose.connection.models['Recurso'];

const RecursoSchema = new mongoose.Schema({
    area: String,
    item: String,
    recurso: String,
    uso: String,
    ehEssencial: Boolean
}, { collection: 'recursos' });

const Recurso = mongoose.models['Recurso'] || mongoose.model('Recurso', RecursoSchema);

export default {Recurso, RecursoSchema}; 