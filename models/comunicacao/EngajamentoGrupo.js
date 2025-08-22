import mongoose from 'mongoose';

delete mongoose.connection.models['EngajamentoGrupo'];

const EngajamentoGrupoSchema = new mongoose.Schema({
    grupo: String,
    dependencia: Number,
    influencia: Number,
    controle: Number,
    impacto: Number,
    engajamento: Number,
    alinhamento: Number,
    nivel_engajamento: String,
    nivel_eng_desejado: String
}, { collection: 'sh_engajamentoGrupo' });

const EngajamentoGrupo = mongoose.models['EngajamentoGrupo'] || mongoose.model('EngajamentoGrupo', EngajamentoGrupoSchema);

export default { EngajamentoGrupo, EngajamentoGrupoSchema };