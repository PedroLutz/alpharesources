import connectToDatabase from '../../../../../lib/db';
import PlanoModel from '../../../../../models/financeiro/Plano';

const { Plano } = PlanoModel;

export default async (req, res) => {
    try {
        await connectToDatabase();

        if (req.method === 'GET') {
            const planos = await Plano.find().sort({ plano: 1, data_esperada: -1 });

            res.status(200).json({ planos });
        } else {
            res.status(405).json({ error: 'Método não permitido' });
        }
    } catch (error) {
        console.error('Erro ao buscar os Planos', error);
        res.status(500).json({ error: 'Erro ao buscar os Planos' });
    }
};
