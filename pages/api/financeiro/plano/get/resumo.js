import connectToDatabase from '../../../../../lib/db';
import PlanoModel from '../../../../../models/financeiro/Plano';

const { Plano } = PlanoModel;

export default async (req, res) => {
    try {
        await connectToDatabase();

        if (req.method === 'GET') {
            const piorPlanoPorArea = await Plano.aggregate([
                {
                    $match: {
                        plano: "Worst scenario"
                    }
                },
                {
                    $group: {
                        _id: "$area",
                        total: {
                            $sum: "$valor_a"
                        }
                    }
                }
            ]);

            const cenarioIdealPorArea = await Plano.aggregate([
                {
                    $match: {
                        plano: "Ideal scenario"
                    }
                },
                {
                    $group: {
                        _id: "$area",
                        total: {
                            $sum: "$valor_a"
                        }
                    }
                },
                {
                    $sort: {
                      _id: 1 // Ordena `_id` (que representa `area`) em ordem decrescente
                    }
                  }
            ]);

            const linhaDoTempo = await Plano.aggregate([
                {
                    $match: {
                        plano: "Ideal scenario"
                    }
                },
                {
                    $group: {
                        _id: "$recurso",
                        data_inicial: { $first: "$data_inicial" },
                        data_esperada: { $first: "$data_esperada" },
                        data_limite: { $first: "$data_limite" }
                    }
                }
            ]);

            const crescimentoDosGastos = await Plano.aggregate([
                {
                    $match: {
                        plano: "Ideal scenario"
                    }
                },
                {
                    $project: {
                        monthYear: {
                            $dateToString: {
                                format: '%Y/%m',
                                date: '$data_esperada'
                            }
                        },
                        valor_a: 1
                    }
                },
                {
                    $group: {
                        _id: '$monthYear',
                        total: { $sum: '$valor_a' }
                    }
                },
                {
                    $sort: { _id: 1 }
                }
            ]);

            res.status(200).json({ piorPlanoPorArea, cenarioIdealPorArea, linhaDoTempo, crescimentoDosGastos });
        } else {
            res.status(405).json({ error: 'Método não permitido' });
        }
    } catch (error) {
        console.error('Erro ao buscar os Planos', error);
        res.status(500).json({ error: 'Erro ao buscar os Planos' });
    }
};
