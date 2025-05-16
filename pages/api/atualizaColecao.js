import connectToDatabase from '../../../lib/db'
import Stakeholder from '../../../models/comunicacao/Stakeholder'

const limparCamposAntigos = async () => {
  await Stakeholder.updateMany({}, {
    $unset: {
      information: "",
      method: "",
      tools: "",
      responsible: ""
    },
    $rename: {
      name: 'grupo',
      involvement: 'envolvimento',
      influence: 'influencia',
      power: 'poder',
      interest: 'interesse',
      expectations: 'expectativas',
      requisites: 'requisitos'
    }
  })
}

const renomearColecao = async () => {
  const db = await connectToDatabase()
  const collections = await db.connection.db.listCollections().toArray()
  const existe = collections.some(col => col.name === 'stakeholders')
  if (!existe) throw new Error('coleção "stakeholders" não encontrada')
  await db.connection.db.renameCollection('stakeholders', 'stakeholderGroups')
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ msg: 'só aceito GET aqui' })
  }

  try {
    await connectToDatabase()
    await limparCamposAntigos()
    await renomearColecao()
    res.status(200).json({ msg: 'migração feita com sucesso' })
  } catch (err) {
    console.error('erro na migração:', err)
    res.status(500).json({ msg: 'erro na migração', erro: err.message })
  }
}
