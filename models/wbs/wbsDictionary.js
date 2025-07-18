import mongoose from 'mongoose';

delete mongoose.connection.models['WbsDictionary'];

const WbsDictionarySchema = new mongoose.Schema({
    area: String,
    item: String,
    descricao: String,
    proposito: String,
    criterio: String,
    verificacao: String,
    timing: String,
    responsavel: String,
    responsavel_aprovacao: String,
    premissas: String,
    restricoes: String,
    recursos: String
}, { collection: 'wbsDictionary' });

const WbsDictionary = mongoose.models['WbsDictionary'] || mongoose.model('WbsDictionary', WbsDictionarySchema);
export default { WbsDictionary , WbsDictionarySchema };