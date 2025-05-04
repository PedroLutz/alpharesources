import connectToDatabase from '../../../../lib/db';
import CbsModel from '../../../../models/recursos/CbStructure';

const { Cbs, CbsSchema } = CbsModel;

export default async (req, res) => {
    try {
        await connectToDatabase();

        if (req.method === 'POST') {
            const propriedadesNomes = Object.keys(CbsSchema.paths);

            const requestBodyObject = {};
            propriedadesNomes.forEach(prop => {
                requestBodyObject[prop] = req.body[prop];
            });

            const newData = new Cbs(requestBodyObject);

            await newData.save();

            res.status(201).json({ message: 'Cbs cadastrado com sucesso!' });
        } else {
            res.status(405).json({ error: 'Método não permitido' });
        }
    } catch (error) {
        console.error('Erro ao cadastrar o Cbs', error);
        res.status(500).json({ error: 'Erro ao cadastrar o Cbs' });
    }
};
