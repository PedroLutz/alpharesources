import mongoose from 'mongoose';

delete mongoose.connection.models['Licao'];

const LicaoSchema = new mongoose.Schema({
    data: Date, 
    tipo: String,
    situacao: String,
    aprendizado: String,
    acao: String
}, { collection: 'licoes' }); 

const Licao = mongoose.models['Licao'] || mongoose.model('Licao', LicaoSchema); 

export default {Licao, LicaoSchema};