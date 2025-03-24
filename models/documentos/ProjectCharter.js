import mongoose from 'mongoose';

delete mongoose.connection.models['ProjectCharter'];

const ProjectCharterSchema = new mongoose.Schema({
  titulo: String,
  padrinho: String,
  gestor: String,
  data_criacao: Date,
  data_atualizacao: Date,
  proposito: String,
  justificativa: String,
  objetivos: String,
  premissas: String,
  restricoes: String,
  escopo: String,
  entregaveis: String,
  estimativa_gastos: String,
  marcos: String,
  stakeholders_ext: String,
  stakeholders_int: String,
  riscos: String,
  assinaturas: String
}, { collection: 'projectCharters' });

const ProjectCharter = mongoose.models['ProjectCharter'] || mongoose.model('ProjectCharter', ProjectCharterSchema);

export default {ProjectCharter, ProjectCharterSchema}; 