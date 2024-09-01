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

            const planosPorArea_all = await PlanoAquisicao.aggregate([
                {
                    $group: {
                        _id: "$area",
                        totalA: { $sum: "$valor_a" },
                        totalB: { $sum: "$valor_b" }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        totalA: 1,
                        totalB: 1,
                        mediaPonderada: {
                            $divide: [
                                { $add: [{ $multiply: ["$totalA", 2] }, "$totalB"] }, // (totalA * 2) + (totalB * 1)
                                3 // soma dos pesos (2 + 1)
                            ]
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

            const planosPorArea_Essencial = await PlanoAquisicao.aggregate([
                {
                    $match: {
                        ehEssencial: true
                    }
                },
                {
                    $group: {
                        _id: "$area",
                        totalA: { $sum: "$valor_a" },
                        totalB: { $sum: "$valor_b" }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        totalA: 1,
                        totalB: 1,
                        mediaPonderada: {
                            $divide: [
                                { $add: [{ $multiply: ["$totalA", 2] }, "$totalB"] }, // (totalA * 2) + (totalB * 1)
                                3 // soma dos pesos (2 + 1)
                            ]
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

            const planosSoma_Essencial = await PlanoAquisicao.aggregate([
                {
                    $match: {
                        ehEssencial: true
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalA: { $sum: "$valor_a" },
                        totalB: { $sum: "$valor_b" }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        totalA: 1,
                        totalB: 1,
                        mediaPonderada: {
                            $divide: [
                                { $add: [{ $multiply: ["$totalA", 2] }, "$totalB"] }, // (totalA * 2) + (totalB * 1)
                                3 // soma dos pesos (2 + 1)
                            ]
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

            const planosSoma_all = await PlanoAquisicao.aggregate([
                {
                    $group: {
                        _id: null,
                        totalA: { $sum: "$valor_a" },
                        totalB: { $sum: "$valor_b" }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        totalA: 1,
                        totalB: 1,
                        mediaPonderada: {
                            $divide: [
                                { $add: [{ $multiply: ["$totalA", 2] }, "$totalB"] }, // (totalA * 2) + (totalB * 1)
                                3 // soma dos pesos (2 + 1)
                            ]
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
            res.status(200).json({ 
                planosPorArea_Essencial, planosPorArea_all,                  
                planosSoma_Essencial, planosSoma_all,               
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
