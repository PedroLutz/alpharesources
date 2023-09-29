import React from 'react';
import { useEffect, useState } from 'react';
import { Chart } from 'react-google-charts';

const Resumo = () => {
  const [totalValor, setTotalValor] = useState(0);
  const [valoresPorArea, setValoresPorArea] = useState([]);

  const chartData = [['Área', 'Valor']];
  valoresPorArea.forEach((area) => {
    chartData.push([area._id, area.total]);
  });

  useEffect(() => {
    // Fazer uma solicitação para a rota existente que retorna as informações de resumo
    fetch('/api/get')
      .then((response) => response.json())
      .then((data) => {
        // Extrair os valores do objeto de resposta
        const { somaValores, valoresPorArea } = data;

        // Definir o estado com os valores obtidos
        setTotalValor(somaValores[0]?.total || 0);
        setValoresPorArea(valoresPorArea);
      })
      .catch((error) => {
        console.error('Erro ao buscar informações de resumo', error);
      });
  }, []);

  return (
    <div>
      <h2>Resumo</h2>
      <p>Total Valor: <span>{totalValor}</span></p>
      
      <h3>Valores por Área:</h3>
      <div>
      <Chart
        width={'100%'}
        height={'400px'}
        chartType="PieChart"
        loader={<div>Carregando Gráfico</div>}
        data={chartData}
        options={{
          title: 'Valores por Área',
        }}
        rootProps={{ 'data-testid': '1' }}
      />
    </div>
    </div>
  );
};

export default Resumo;
