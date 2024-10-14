import connectToDatabase from '../../../../../lib/db';
import RiscoModel from '../../../../../models/riscos/Risco';

const { Risco, RiscoSchema } = RiscoModel;

export default async (req, res) => {
    try {
        await connectToDatabase();

        if (req.method === 'GET') {
            const riscosAgrupados = await Risco.aggregate([
                {
                    $group: {
                        _id: "$area",
                        riscos: { $push: "$risco" }
                    }
                },
                { $sort: { _id: 1 } }
            ]);

            res.status(200).json({ riscosAgrupados });
        } else {
            res.status(405).json({ error: 'Método não permitido' });
        }
    } catch (error) {
        console.error('Erro ao buscar os Riscos', error);
        res.status(500).json({ error: 'Erro ao buscar os Riscos' });
    }
};