// pages/api/get.js
import connectToDatabase from '../../../lib/db';
import Plano from '../../../models/Plano';

export default async (req, res) => {
  try {
    await connectToDatabase();

    if (req.method === 'GET') {
      // Consulte o banco de dados para buscar todas as pessoas
      const planos = await Plano.find().sort({ plano: 1 });

      const piorPlanoPorArea = await Plano.aggregate([
        {
          $match: {
            plano: "Pior Cenário" // Filtra apenas os planos com nome "Pior Plano"
          }
        },
        {
          $group: {
            _id: "$area", // Agrupa por área
            total: {
              $sum: "$valor_a" // Soma os valores de "valor_a" para cada área
            }
          }
        }
      ]);

      const cenarioIdealPorArea = await Plano.aggregate([
        {
          $match: {
            plano: "Cenário Ideal" // Filtra apenas os planos com nome "Pior Plano"
          }
        },
        {
          $group: {
            _id: "$area", // Agrupa por área
            total: {
              $sum: "$valor_a" // Soma os valores de "valor_a" para cada área
            }
          }
        }
      ]);

      const linhaDoTempo = await Plano.aggregate([
        {
          $match: {
            plano: "Cenário Ideal"
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
      
      const crescimentoDosGastos = await Plano.aggregate([
        {
          $match: {
            plano: "Cenário Ideal"
          }
        },
        {
          $project: {
            monthYear: {
              $dateToString: {
                format: '%m/%Y', // Formato MM/AAAA
                date: '$data_esperada' // Campo da data
              }
            },
            valor_a: 1 // Mantém o campo 'valor' no resultado
          }
        },
        {
          $group: {
            _id: '$monthYear', // Agrupa por mês/ano
            total: { $sum: '$valor_a' } // Soma os valores para cada mês/ano
          }
        },
        {
          $sort: { _id: 1 } // Ordena por mês/ano
        }
      ]);
      
      res.status(200).json({ planos, piorPlanoPorArea, cenarioIdealPorArea , linhaDoTempo, crescimentoDosGastos});
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro ao buscar planos', error);
    res.status(500).json({ error: 'Erro ao buscar planos' });
  }
};
