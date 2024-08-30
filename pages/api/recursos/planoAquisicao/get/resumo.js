import connectToDatabase from '../../../../../lib/db';
import PlanoAquisicaoModel from '../../../../../models/recursos/PlanoAquisicao';

const { PlanoAquisicao } = PlanoAquisicaoModel;

export default async (req, res) => {
    try {
        await connectToDatabase();

        if (req.method === 'GET') {
            const planosAPorArea_all = await PlanoAquisicao.aggregate([
                {
                    $group: {
                        _id: "$area",
                        total: {
                            $sum: "$valor_a"
                        }
                    }
                }
            ]);

            const planosBPorArea_all = await PlanoAquisicao.aggregate([
                {
                    $group: {
                        _id: "$area",
                        total: {
                            $sum: "$valor_b"
                        }
                    }
                }
            ]);

            const planosAPorArea_Essencial = await PlanoAquisicao.aggregate([
                {
                    $match: {
                        ehEssencial: true
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

            const planosBPorArea_Essencial = await PlanoAquisicao.aggregate([
                {
                    $match: {
                        ehEssencial: true
                    }
                },
                {
                    $group: {
                        _id: "$area",
                        total: {
                            $sum: "$valor_b"
                        }
                    }
                }
            ]);

            const planosASoma_Essencial = await PlanoAquisicao.aggregate([
                {
                    $match: {
                        ehEssencial: true
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: {
                            $sum: "$valor_a"
                        }
                    }
                }
            ]);

            const planosBSoma_Essencial = await PlanoAquisicao.aggregate([
                {
                    $match: {
                        ehEssencial: true
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: {
                            $sum: "$valor_b"
                        }
                    }
                }
            ]);

            const planosASoma_all = await PlanoAquisicao.aggregate([
                {
                    $group: {
                        _id: null,
                        total: {
                            $sum: "$valor_a"
                        }
                    }
                }
            ]);

            const planosBSoma_all = await PlanoAquisicao.aggregate([
                {
                    $group: {
                        _id: null,
                        total: {
                            $sum: "$valor_b"
                        }
                    }
                }
            ]);

            const linhaDoTempoAll = await PlanoAquisicao.aggregate([
                {
                    $group: {
                        _id: "$recurso",
                        data_esperada: { $first: "$data_esperada" },
                        data_limite: { $first: "$data_limite" }
                    }
                }
            ]);

            const linhaDoTempoEssencial = await PlanoAquisicao.aggregate([
                {
                    $match: {
                        ehEssencial: true
                    }
                },
                {
                    $group: {
                        _id: "$recurso",
                        data_esperada: { $first: "$data_esperada" },
                        data_limite: { $first: "$data_limite" }
                    }
                }
            ]);
            res.status(200).json({ planosAPorArea_Essencial, planosBPorArea_Essencial, planosAPorArea_all, planosBPorArea_all,
                                    planosASoma_Essencial, planosBSoma_Essencial, planosASoma_all, planosBSoma_all,
                                    linhaDoTempoEssencial, linhaDoTempoAll
             });
        } else {
            res.status(405).json({ error: 'Método não permitido' });
        }
    } catch (error) {
        console.error('Erro ao buscar os Planos', error);
        res.status(500).json({ error: 'Erro ao buscar os Planos' });
    }
};
