// pages/api/get.js
import connectToDatabase from '../../../../lib/db';
import Lancamento from '../../../../models/financeiro/Lancamento';

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'GET') {
      // Consulte o banco de dados para buscar todas as pessoas
      const lancamentos = await Lancamento.find().sort({ data: -1 });

      // Consulta para obter a soma de todos os valores
      const somaValores = await Lancamento.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: '$valor' }
          }
        }
      ]);

      const receitasTotais = await Lancamento.aggregate([
        {
          $match: {
            valor: { $gt: 0 } 
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$valor' }
          }
        }
      ]);

      const despesasTotais = await Lancamento.aggregate([
        {
          $match: {
            valor: { $lt: 0 }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$valor' }
          }
        }
      ]);

      // Consulta para obter os valores agrupados por área
      const receitasPorArea = await Lancamento.aggregate([
        {
          $match: {
            valor: { $gt: 0 } // Filtra valores maiores que zero
          }
        },
        {
          $group: {
            _id: '$area',
            total: { $sum: '$valor' }
          }
        }
      ]);

      const despesasPorArea = await Lancamento.aggregate([
        {
          $match: {
            valor: { $lt: 0 } // Filtra valores maiores que zero
          }
        },
        {
          $group: {
            _id: '$area',
            total: { $sum: '$valor' }
          }
        }
      ]);

      const receitasPorMes = await Lancamento.aggregate([
        {
          $match: {
            valor: { $gt: 0 } // Filtra valores maiores que zero
          }
        },
        {
          $project: {
            monthYear: {
              $dateToString: {
                format: '%Y/%m', // Formato MM/AAAA
                date: '$data' // Campo da data
              }
            },
            valor: 1 // Mantém o campo 'valor' no resultado
          }
        },
        {
          $group: {
            _id: '$monthYear', // Agrupa por mês/ano
            total: { $sum: '$valor' } // Soma os valores para cada mês/ano
          }
        },
        {
          $sort: { _id: 1 } // Ordena por mês/ano
        }
      ]);

      const despesasPorMes = await Lancamento.aggregate([
        {
          $match: {
            valor: { $lt: 0 } // Filtra valores menores que zero (despesas)
          }
        },
        {
          $project: {
            monthYear: {
              $dateToString: {
                format: '%Y/%m', // Formato MM/AAAA
                date: '$data' // Campo da data
              }
            },
            valor: 1 // Mantém o campo 'valor' no resultado
          }
        },
        {
          $group: {
            _id: '$monthYear', // Agrupa por mês/ano
            total: { $sum: '$valor' } // Soma os valores para cada mês/ano
          }
        },
        {
          $sort: { _id: 1 } // Ordena por mês/ano
        }
      ]);      

      const maiorEMenorValor = await Lancamento.aggregate([
        {
          $group: {
            _id: null,
            min: { $min: '$valor' },
            max: { $max: '$valor' },
          }
        }
      ])

      res.status(200).json({ lancamentos, somaValores, receitasPorArea, despesasPorArea, receitasPorMes, despesasPorMes, maiorEMenorValor, receitasTotais, despesasTotais });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao buscar lançamentos', error);
    res.status(500).json({ error: 'Erro ao buscar lançamentos' });
  }
};
