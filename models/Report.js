import mongoose from 'mongoose';

delete mongoose.connection.models['Report'];

const ReportSchema = new mongoose.Schema({
    mesAno: String,
    problemas: String,
    escopo_info: String,
    cronograma_info: String,
    riscos_info: String,
    qualidade_info: String,
    notas: String
}, { collection: 'reports' }); 

const Report = mongoose.models['Report'] || mongoose.model('Report', ReportSchema);
export default {Report, ReportSchema};