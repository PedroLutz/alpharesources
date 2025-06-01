import connectToDatabase from '../../lib/db'
import FuncaoModel from '../../models/responsabilidade/Funcao'

const {Funcao} = FuncaoModel;

const limparCamposAntigos = async () => {
  await Funcao.updateMany({}, {
    $unset: {
      itens: ''
    },
  })
}

const renomearColecao = async () => {
  const db = await connectToDatabase()
  const collections = await db.connection.db.listCollections().toArray()
  const existe = collections.some(col => col.name === 'funcao')
  if (!existe) throw new Error('coleção "funcao" não encontrada')
  await db.connection.db.renameCollection('funcao', 'stakeholderGroups')
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ msg: 'só aceito GET aqui' })
  }

  try {
    await connectToDatabase()
    await limparCamposAntigos()
    // await renomearColecao()
    res.status(200).json({ msg: 'migração feita com sucesso' })
  } catch (err) {
    console.error('erro na migração:', err)
    res.status(500).json({ msg: 'erro na migração', erro: err.message })
  }
}
