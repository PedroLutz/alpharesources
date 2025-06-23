import connectToDatabase from '../../../../lib/db';
import { verificarAuth } from '../../../../lib/verifica_auth';
import GanttModel from '../../../../models/Gantt';

const { Gantt } = GanttModel;

export default async (req, res) => {
    try {
        await connectToDatabase();

        const user = verificarAuth(req);
        if (!user) {
            return res.status(401).json({ error: 'Not authorized' });
        }

        if (req.method === 'GET') {

            const [limitesProjeto] = await Gantt.aggregate([
                { $match: { plano: true } },
                {
                    $group: {
                        _id: null,
                        inicioProjeto: { $min: "$inicio" },
                        fimProjeto: { $max: "$termino" }
                    }
                }
            ])

            const [inicio, fim] = [new Date(limitesProjeto.inicioProjeto), new Date(limitesProjeto.fimProjeto)];

            function gerarUltimosDiasPorMes(inicio, fim) {
                const datas = []
                const atual = new Date(inicio.getFullYear(), inicio.getMonth(), 1)

                while (atual <= fim) {
                    const ultimoDia = new Date(atual.getFullYear(), atual.getMonth() + 1, 0)
                    datas.push(ultimoDia)
                    atual.setMonth(atual.getMonth() + 1)
                }

                return datas
            }

            const ultimosDias = gerarUltimosDiasPorMes(
                new Date(limitesProjeto.inicioProjeto),
                new Date(limitesProjeto.fimProjeto)
            )


            const duracaoTotal = new Date(limitesProjeto.fimProjeto) - new Date(limitesProjeto.inicioProjeto)

            const execucaoMensal = ultimosDias.map(data => {
                let porcentagem = 0

                if (data < inicio) {
                    porcentagem = 0
                } else if (data > fim) {
                    porcentagem = 100
                } else {
                    const diasPassados = data - inicio
                    porcentagem = (diasPassados / duracaoTotal) * 100
                }

                const mesFormatado = `${data.getFullYear()}/${String(data.getMonth() + 1).padStart(2, '0')}`

                return {
                    mes: mesFormatado,
                    porcentagemExecucao: porcentagem
                }
            })


            res.status(200).json({ execucaoMensal });
        } else {
            res.status(405).json({ error: 'Método não permitido' });
        }
    } catch (error) {
        console.error('Erro ao buscar os Gantts', error);
        res.status(500).json({ error: 'Erro ao buscar os Gantts' });
    }
};