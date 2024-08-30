import mongoose from 'mongoose';

delete mongoose.connection.models['PlanoAquisicao'];

const PlanoAquisicaoSchema = new mongoose.Schema({
    area: String,
    ehEssencial: Boolean,
    recurso: String,
    plano_a: String,
    valor_a: Number,
    data_esperada: Date,
    data_limite: Date,
    plano_b: String,
    valor_b: Number,
    plano_real: String,
    data_real: String,
    valor_real: Number
}, { collection: 'planosAquisicao' });

const PlanoAquisicao = mongoose.models['PlanoAquisicao'] || mongoose.model('PlanoAquisicao', PlanoAquisicaoSchema);

export default {PlanoAquisicao, PlanoAquisicaoSchema}; 