import { useEffect, useState, useMemo } from 'react';
import { Chart } from 'react-google-charts';
import { sortBy } from 'lodash';
import Loading from '../../../ui/Loading';
import styles from '../../../../styles/modules/resumo.module.css'
import { fetchData } from '../../../../functions/crud';
import tabela from '../../../../styles/modules/financas.module.css'

const { grafico, pie_direita, pie_esquerda, pie_container, h3_resumo, custom_span } = styles;

const Resumo = () => {
  const [totalValor, setTotalValor] = useState(0);
  const [receitasPorArea, setReceitasPorArea] = useState([]);
  const [despesasPorArea, setDespesasPorArea] = useState([]);
  const [receitasPorMes, setReceitasPorMes] = useState([]);
  const [despesasPorMes, setDespesasPorMes] = useState([]);
  const [maiorValor, setMaiorValor] = useState([]);
  const [menorValor, setMenorValor] = useState([]);
  const [kpis, setKpis] = useState([])
  const [receitasTotais, setReceitasTotais] = useState([]);
  const [despesasTotais, setDespesasTotais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cores, setCores] = useState({});
  const [curvaS, setCurvaS] = useState([]);
  const [curvaSTabela, setCurvaSTabela] = useState([]);

  //gerar Array do grafico de pizza Receitas Por Area
  const ReceitasPorAreaGraph = useMemo(() => {
    if (receitasPorArea.length === 0) return [['Area', 'Value']];
    const graph = [['Area', 'Value']];
    receitasPorArea.forEach((area) => {
      graph.push([area._id, area.total]);
    });
    return graph;
  }, [receitasPorArea]);


  //gerar Array do grafico de pizza Despesas por Area
  const DespesasPorAreaGraph = useMemo(() => {
    if (despesasPorArea.length === 0) return [['Area', 'Value']];
    const graph = [['Area', 'Value']];
    despesasPorArea.forEach((area) => {
      graph.push([area._id, -area.total]);
    });
    return graph;
  }, [despesasPorArea]);

  //gerar Array do grafico de colunas de valores por area
  const ValoresPorAreaGraph = useMemo(() => {
    if (receitasPorArea.length == 0 || despesasPorArea.length == 0) return [['Area', 'Revenue', 'Expense']]
    const graph = [['Area', 'Revenue', 'Expense']];
    const areasGanhos = new Set(receitasPorArea.map((receitaArea) => receitaArea._id));
    const areasGastos = new Set(despesasPorArea.map((despesaArea) => despesaArea._id));
    const todasAreas = Array.from(new Set([...areasGanhos, ...areasGastos]));

    todasAreas.forEach((areaNome) => {
      const receitaArea = receitasPorArea.find((receita) => receita._id === areaNome);
      const receitaValor = receitaArea ? receitaArea.total : 0;

      const despesaArea = despesasPorArea.find((despesa) => despesa._id === areaNome);
      const despesaValor = despesaArea ? -despesaArea.total : 0;

      graph.push([areaNome, receitaValor, despesaValor]);
    });

    return graph;
  }, [receitasPorArea, despesasPorArea])

  //gerar Array do grafico de colunas de valores por mês, crescimento mensal e gasto mensal
  const [ValoresPorMesGraph, CashFlowMensal, CaixaMensalGraph, CrescimentoDosGastosGraph] = useMemo(() => {
    if (receitasPorMes.length == 0 || despesasPorMes.length == 0) {
      return [
        [['Month', 'Revenue', 'Expense']],
        [],
        [['Month', 'Value']],
        [['Month', 'Value']]
      ]
    }
    const valoresGraph = [['Month', 'Revenue', 'Expense']];
    const cashFlow = [];
    const caixaGraph = [['Month', 'Value']];
    const crescimentoGraph = [['Month', 'Value']];

    let saldoAcumulado = 0;
    let gastosAcumulados = 0;

    const mesesGanhos = new Set(receitasPorMes.map((receitaMes) => receitaMes._id));
    const mesesGastos = new Set(despesasPorMes.map((despesaMes) => despesaMes._id));
    const todosMeses = sortBy(Array.from(new Set([...mesesGanhos, ...mesesGastos])));
    todosMeses.forEach((mesNome) => {
      const receitaMes = receitasPorMes.find((receita) => receita._id === mesNome);
      const receitaValor = receitaMes ? receitaMes.total : 0;

      const despesaMes = despesasPorMes.find((despesa) => despesa._id === mesNome);
      const despesaValor = despesaMes ? -despesaMes.total : 0;

      const saldoMes = receitaValor - despesaValor;

      saldoAcumulado += saldoMes;
      gastosAcumulados += despesaValor;

      const dateParts = mesNome.split('/');
      const formattedDate = `${dateParts[1]}/${dateParts[0]}`;

      valoresGraph.push([formattedDate, receitaValor, despesaValor]);
      cashFlow.push({
        mes: formattedDate, receita: receitaValor, despesa: despesaValor,
        movimento: saldoMes, balanco: saldoAcumulado
      })
      caixaGraph.push([formattedDate, saldoAcumulado]);
      crescimentoGraph.push([formattedDate, gastosAcumulados]);
    });

    return [
      valoresGraph,
      cashFlow,
      caixaGraph,
      crescimentoGraph
    ]

  }, [receitasPorMes, despesasPorMes])

  //receber dados das financas e criar tabelas de KPIs e CurvaS
  const fetchResumos = async () => {
    try {
      const data = await fetchData('financas/financas/get/resumo');
      const { somaValores, receitasPorArea, despesasPorArea,
        receitasPorMes, despesasPorMes, maiorEMenorValor,
        receitasTotais, despesasTotais } = data;
      setTotalValor(somaValores[0]?.total || 0);
      setReceitasPorArea(receitasPorArea);
      setDespesasPorArea(despesasPorArea);
      setReceitasPorMes(receitasPorMes);
      setDespesasPorMes(despesasPorMes);
      setMaiorValor(maiorEMenorValor[0]?.max || 0);
      setMenorValor(maiorEMenorValor[0]?.min || 0);
      setReceitasTotais(receitasTotais[0]?.total || 0);
      setDespesasTotais(despesasTotais[0]?.total || 0);

      const dataValoresPlanejados = await fetchData('recursos/planoAquisicao/get/valoresPorArea');
      const valoresPlanejados = dataValoresPlanejados.valoresPorArea_all;

      const dadosValoresPlanejadosMensais = await fetchData('recursos/planoAquisicao/get/valoresPorMes');
      const valoresPlanejadosMensais = dadosValoresPlanejadosMensais.valoresPorMes;

      const comparacoesPorcentagem = await fetchData('cronograma/get/comparacoesPorcentagem');
      const porcentagensDeExecucao = comparacoesPorcentagem.percentageComparison;

      const porcentagemExecucaoMensal_dados = await fetchData('cronograma/get/porcentagemExecucaoMensal');
      const porcentagemExecucaoMensal = porcentagemExecucaoMensal_dados.execucaoMensal;

      const totalPlanejado = valoresPlanejadosMensais.reduce(
        (acc, cur) => acc + (2 * cur.total_valor_a + cur.total_valor_b) / 3, 0
      )

      const curvaSGraph = [["Month", "Planned Cost", "Aggregated Value", "Actual Cost"]];
      const curvaStabelaArray = [];

      var gastosMensaisAcumuladosPlano = 0;
      var gastosMensaisAcumulados = 0;
      porcentagemExecucaoMensal.forEach(obj => {
        const mes = obj.mes;
        const valorPlanejado = valoresPlanejadosMensais.find((plano) => plano.mes === mes) || { total_valor_a: 0, total_valor_b: 0, mes: mes };
        gastosMensaisAcumuladosPlano += ((2 * valorPlanejado.total_valor_a + valorPlanejado.total_valor_b) / 3)
        const gastoNoMes = -1 * (despesasPorMes.find((despesa) => despesa._id === mes)?.total || 0);
        gastosMensaisAcumulados += gastoNoMes;
        const execucaoNoMes = obj.porcentagemExecucao;
        const valorAgregado = execucaoNoMes * totalPlanejado / 100;

        curvaSGraph.push([
          valorPlanejado.mes,
          parseFloat(gastosMensaisAcumuladosPlano.toFixed(2)),
          parseFloat(valorAgregado.toFixed(2)),
          parseFloat(gastosMensaisAcumulados.toFixed(2))
        ]);

        curvaStabelaArray.push({
          mes: valorPlanejado.mes,
          gastoMensal: parseFloat(gastoNoMes.toFixed(2)),
          gastoMensalAcumulado: parseFloat(gastosMensaisAcumulados.toFixed(2)),
          gastoPlanejado: parseFloat(((2 * valorPlanejado.total_valor_a + valorPlanejado.total_valor_b) / 3).toFixed(2)),
          gastoPlanejadoAcumulado: parseFloat(gastosMensaisAcumuladosPlano.toFixed(2)),
          valorAgregado: parseFloat(valorAgregado.toFixed(2))
        })
      })

      setCurvaS(curvaSGraph);
      setCurvaSTabela(curvaStabelaArray);

      const kpis = valoresPlanejados.map(vp => {
        const area = vp._id;

        const comparacao = porcentagensDeExecucao.find(c => c.area === area);
        const despesa = despesasPorArea.find(d => d._id === area);

        const valorPlanejado = parseFloat((vp.totalValorA * 2 + vp.totalValorB) / 3).toFixed(2);
        const porcentagem = comparacao ? comparacao.porcentagem : 0;
        const custoReal = despesa ? despesa.total.toFixed(2) : 0;
        const valorAgregado = valorPlanejado * (porcentagem / 100);

        return {
          area,
          valorPlanejado,
          custoReal,
          porcentagem,
          valorAgregado
        };
      });
      setKpis(kpis);
    } finally {
      setLoading(false);
    }
  };

  //buscar dados de cores
  const fetchCores = async () => {
    const data = await fetchData('wbs/get/cores');
    var cores = {};
    data.areasECores.forEach((area) => {
      cores = { ...cores, [area._id]: area.cor[0] ? area.cor[0] : '' }
    })
    setCores(cores);
  }


  //useEffect que so executa na primeira render
  useEffect(() => {
    fetchResumos();
    fetchCores();
  }, []);


  //definicao do estiloGraph
  const estiloGraph = {
    backgroundColor: 'transparent',
    titleTextStyle: {
      color: "black"
    },
    legend: {
      textStyle: { color: 'black' }
    },
    hAxis: {
      textStyle: { color: 'black' },
      gridlines: { color: 'black' }
    },
    vAxis: {
      textStyle: { color: 'black' },
    },
  }

  return (
    <div className={h3_resumo}>
      {loading && <Loading />}
      <div className="centered-container">
        <h2 className="smallTitle">Report</h2>

        <div>
          <span className={custom_span}>Cash value:<br />R${Number(totalValor).toFixed(2)}</span>
          <br />
          <span className={custom_span}>Largest income:<br />{Number(maiorValor).toFixed(2) > 0 ? `R$${Number(maiorValor).toFixed(2)}` : 'R$0.00'}</span>
          <span className={custom_span}>Total revenue:<br />R${Number(receitasTotais).toFixed(2)}</span>
          <span className={custom_span}>Largest expense:<br />{menorValor < 0 ? `R$${Number(-menorValor).toFixed(2)}` : 'R$0.00'}</span>
          <span className={custom_span}>Total cost:<br />R${Number(-despesasTotais).toFixed(2)}</span>
        </div>

      </div>

      <div className='centered-container'>
        <h3>KPIs per area</h3>
        <div className={tabela.tabela_financas_container}>
          <div className={tabela.tabela_financas_wrapper}>
            <table className={`${tabela.cash_flow} tabela`}>
              <thead>
                <tr>
                  <th style={{ width: '8rem' }}>Area</th>
                  <th>Planned cost</th>
                  <th>Real cost</th>
                  <th>Percentage of execution</th>
                  <th>Aggregated value*</th>
                  <th>Cost performance index**</th>
                </tr>
              </thead>
              <tbody>
                {kpis.map((item, index) => (
                  <tr key={index}>
                    <td>{item.area}</td>
                    <td>R${item.valorPlanejado}</td>
                    <td>R${item.custoReal * -1}</td>
                    <td>{Number(item.porcentagem).toFixed(2)}%</td>
                    <td>R${Number(item.valorAgregado).toFixed(2)}</td>
                    <td>{item.custoReal == 0 ? '-'
                      : (Number(item.valorAgregado / (item.custoReal * -1)).toFixed(2)) != 0 ?
                        Number(item.valorAgregado / (item.custoReal * -1)).toFixed(2) : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>


        <p style={{ fontSize: 'small' }}>*Percentage of execution multiplied by the planned cost</p>
        <p style={{ fontSize: 'small', marginTop: '-0.8rem' }}>**Aggregated value/Real cost</p>
      </div>

      <div className='centered-container'>
        <h3>Monthly Cash Flow</h3>
        <div className={tabela.tabela_financas_container}>
          <div className={tabela.tabela_financas_wrapper}>
            <table className={`${tabela.cash_flow} tabela`}>
              <thead>
                <tr>
                  <th>Month</th>
                  {CashFlowMensal.map((valores, index) => (
                    <th key={index}>{valores.mes}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th>Income</th>
                  {CashFlowMensal.map((valores, index) => (
                    <td key={index}>R${Number(valores.receita).toFixed(2)}</td>
                  ))}
                </tr>
                <tr>
                  <th>Expense</th>
                  {CashFlowMensal.map((valores, index) => (
                    <td key={index}>R${Number(valores.despesa).toFixed(2)}</td>
                  ))}
                </tr>
                <tr>
                  <th>Net Movement</th>
                  {CashFlowMensal.map((valores, index) => (
                    <td key={index}>R${Number(valores.movimento).toFixed(2)}</td>
                  ))}
                </tr>
                <tr>
                  <th>Net Balance</th>
                  {CashFlowMensal.map((valores, index) => (
                    <td key={index}>R${Number(valores.balanco).toFixed(2)}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div>
        <h3>Releases per area</h3>

        <div style={{ display: 'flex' }} className={pie_container}>
          <div className={pie_esquerda}>
            <Chart
              width={"100%"}
              height={"400px"}
              chartType="PieChart"
              loader={<div>Loading graph</div>}
              data={ReceitasPorAreaGraph}
              options={{
                ...estiloGraph,
                title: 'Revenues per area',
                slices: ReceitasPorAreaGraph.slice(1).map((row, index) => ({
                  color: cores[row[0]] || '#ccc',
                })),
                pieSliceTextStyle: {
                  color: 'black',
                },
              }}
              rootProps={{ 'data-testid': '1' }}
            />
          </div>

          <div className={pie_direita}>
            <Chart
              width={"100%"}
              height={"400px"}
              chartType="PieChart"
              loader={<div>Loading graph</div>}
              data={DespesasPorAreaGraph}
              options={{
                ...estiloGraph,
                title: 'Costs per area',
                slices: DespesasPorAreaGraph.slice(1).map((row) => ({
                  color: cores[row[0]] || '#ccc', // usa a cor correta para cada área
                })),
                pieSliceTextStyle: {
                  color: 'black', // Define a cor das porcentagens como preta
                },
              }}

              rootProps={{ 'data-testid': '1' }}
            />
          </div>
        </div>

        <div className={grafico}>
          <Chart
            width={"90%"}
            height={"400px"}
            chartType="ColumnChart"
            loader={<div>Loading graph</div>}
            options={{ ...estiloGraph, colors: ['green', 'red'] }}
            data={ValoresPorAreaGraph}
            rootProps={{ 'data-testid': '1' }}
          />
        </div>
      </div>

      <div className={grafico}>
        <h3>S Curve</h3>
        <Chart
          width={"90%"}
          height={"400px"}
          chartType="LineChart"
          loader={<div>Loading graph</div>}
          data={curvaS}
          options={{
            ...estiloGraph,
            colors: ["red", "blue", "green"],
            curveType: 'function',
            series: {
              0: { lineDashStyle: [1, 1] },
              1: { lineDashStyle: [4, 2] },
              2: { lineDashStyle: [8, 5] }
            }
          }}
          rootProps={{ 'data-testid': '1' }}
        />
      </div>

      <div className='centered-container'>
        <h3>S Curve Data</h3>
        <div className={tabela.tabela_financas_container}>
            <div className={tabela.tabela_financas_wrapper}>
              <table className={`tabela ${tabela.cash_flow}`}>
          <thead>
            <tr>
              <th>Month</th>
              {curvaSTabela.map((valores, index) => (
                <th key={index}>{valores.mes}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>Monthly expense</th>
              {curvaSTabela.map((valores, index) => (
                <td key={index}>R${Number(valores.gastoMensal).toFixed(2)}</td>
              ))}
            </tr>
            <tr>
              <th  >Accumulated monthly expense</th>
              {curvaSTabela.map((valores, index) => (
                <td key={index}>R${Number(valores.gastoMensalAcumulado).toFixed(2)}</td>
              ))}
            </tr>
            <tr>
              <th>Monthly planned cost</th>
              {curvaSTabela.map((valores, index) => (
                <td key={index}>R${Number(valores.gastoPlanejado).toFixed(2)}</td>
              ))}
            </tr>
            <tr>
              <th>Accumulated monthly planned cost</th>
              {curvaSTabela.map((valores, index) => (
                <td key={index}>R${Number(valores.gastoPlanejadoAcumulado).toFixed(2)}</td>
              ))}
            </tr>
            <tr>
              <th>Aggregated Value</th>
              {curvaSTabela.map((valores, index) => (
                <td key={index}>R${Number(valores.valorAgregado).toFixed(2)}</td>
              ))}
            </tr>
          </tbody>

        </table>
            </div>
        </div>
        
      </div>

      <div>
        <h3>Releases per month</h3>
        <div className={grafico}>
          <Chart
            width={"90%"}
            height={"400px"}
            chartType="ColumnChart"
            loader={<div>Loading graph</div>}
            data={ValoresPorMesGraph}
            options={{
              ...estiloGraph,
              title: 'Releases per month',
              colors: ['green', 'red']
            }}
            rootProps={{ 'data-testid': '1' }}
          />
        </div>

        <div className={grafico}>
          <h3>Cash value per month</h3>
          <Chart
            width={"90%"}
            height={"400px"}
            chartType="LineChart"
            loader={<div>Loading graph</div>}
            data={CaixaMensalGraph}
            options={{
              ...estiloGraph,
              colors: ["#ff00e3"],
              series: {
                0: {
                  lineWidth: 5,
                },
              },

            }}
            rootProps={{ 'data-testid': '1' }}
          />
        </div>

        <div className={grafico}>
          <h3>Cost growth per month</h3>
          <Chart
            width={"90%"}
            height={"400px"}
            chartType="LineChart"
            loader={<div>Loading graph</div>}
            data={CrescimentoDosGastosGraph}
            options={{
              ...estiloGraph, colors: ["#ff00e3"],
              series: {
                0: {
                  lineWidth: 5,
                },
              }
            }}
            rootProps={{ 'data-testid': '1' }}
          />
        </div>
      </div>
    </div>
  );
};

export default Resumo;