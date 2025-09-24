import { useState, useEffect, useMemo } from 'react';
import { Chart } from 'react-google-charts';
import Loading from '../../../ui/Loading';
import { sortBy } from 'lodash';
import styles from '../../../../styles/modules/resumo.module.css'
import { handlePostFetch, handleFetch } from '../../../../functions/crud_s';
import tabela from '../../../../styles/modules/financas.module.css'
import useAuth from '../../../../hooks/useAuth';

const { grafico, pie_direita, pie_esquerda, pie_container, h3_resumo, custom_span } = styles;

const Resumo = () => {
    const { user, token } = useAuth();

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

    const fetchResumos = async () => {
        const monthly_summary = await handlePostFetch({
            table: "financial_release",
            query: 'monthly_summary',
            token,
            data: { uid: user.id },
        });

        const receitasPorMesArr = [];
        monthly_summary.data.forEach(obj => {
            if (obj.type == 'income') {
                const exchangeValue = monthly_summary?.data?.find(o => o.type == 'exchange' && o.month == obj.month)?.total || 0;
                receitasPorMesArr.push({ month: obj.month, total: obj.total + exchangeValue });
            }
        })
        setReceitasPorMes(receitasPorMesArr);

        const despesasPorMesArr = [];
        monthly_summary.data.forEach(obj => {
            if (obj.type == 'cost') {
                const exchangeValue = monthly_summary?.data?.find(o => o.type == 'exchange' && o.month == obj.month)?.total || 0;
                despesasPorMesArr.push({ month: obj.month, total: -obj.total + exchangeValue });
            }
        })
        setDespesasPorMes(despesasPorMesArr);


        //------------------------------------------------AREA SUMMARY--------------------------------------------------
        const area_summary = await handlePostFetch({
            table: "financial_release",
            query: 'area_summary',
            token,
            data: { uid: user.id },
        });

        const receitasPorAreaArr = [];
        area_summary.data.forEach(obj => {
            if (obj.type == 'income') {
                const exchangeValue = area_summary?.data?.find(o => o.type == 'exchange' && o.area_id == obj.area_id)?.total || 0;
                receitasPorAreaArr.push({ area_id: obj.area_id, area_name: obj.area_name, area_color: obj.area_color, total: obj.total + exchangeValue });
            }
        })
        setReceitasPorArea(receitasPorAreaArr);

        const despesasPorAreaArr = [];
        area_summary.data.forEach(obj => {
            if (obj.type == 'cost') {
                const exchangeValue = area_summary?.data?.find(o => o.type == 'exchange' && o.area_id == obj.area_id)?.total || 0;
                despesasPorAreaArr.push({ area_id: obj.area_id, area_name: obj.area_name, area_color: obj.area_color, total: -obj.total + exchangeValue });
            }
        })
        setDespesasPorArea(despesasPorAreaArr);


        //------------------------------------------------TOTAL SUMMARY--------------------------------------------------
        const total_summary = await handlePostFetch({
            table: "financial_release",
            query: 'total_summary',
            token,
            data: { uid: user.id },
        });

        setReceitasTotais(total_summary?.data[0]?.total + total_summary?.data[2]?.total);
        setDespesasTotais(-total_summary?.data[1]?.total + total_summary?.data[2]?.total);
        setTotalValor(total_summary?.data[0]?.total + total_summary?.data[1]?.total);


        //------------------------------------------------MIN MAX--------------------------------------------------
        const min_max = await handlePostFetch({
            table: "financial_release",
            query: 'min_max',
            token,
            data: { uid: user.id },
        })

        setMaiorValor(min_max?.data[0]?.max_value || 0);
        setMenorValor(min_max?.data[0]?.min_value || 0);


        //------------------------------------------------S CURVE--------------------------------------------------
        const plan_monthly_summary = await handlePostFetch({
            table: "resource_acquisition_plan",
            query: 'monthly_summary',
            token,
            data: { uid: user.id },
        })
        const valoresPlanejadosMensais = plan_monthly_summary?.data;
        valoresPlanejadosMensais.forEach(o => {
          const planoDate = o.month.split("-");
          o.month = `${planoDate[0]}/${planoDate[1]}`;
        })

        const totalPlanejado = valoresPlanejadosMensais.reduce(
            (acc, cur) => acc + (2 * cur.total_a + cur.total_b) / 3, 0
        )

        const plan_area_summary = await handlePostFetch({
            table: "resource_acquisition_plan",
            query: 'area_summary',
            token,
            data: { uid: user.id },
        })
        const valoresPlanejadosAreas = plan_area_summary?.data;


        const area_durations = await handlePostFetch({
            table: "gantt",
            query: 'area_durations',
            token,
            data: { uid: user.id },
        })

        const porcentagensDeExecucao = [];
        for (let i = 0; i < area_durations?.data?.length; i = i + 2) {
            const real = area_durations?.data[i];
            const plan_duration = area_durations?.data[i + 1]?.duration_days;
            const porcentagem = real?.duration_days * 100 / plan_duration;
            porcentagensDeExecucao.push({ area_id: real.area_id, area_name: real.area_name, porcentagem })
        }

        const first_and_last = await handlePostFetch({
            table: "gantt",
            query: 'first_and_last',
            token,
            data: { uid: user.id },
        })
        const limitesProjeto = first_and_last?.data[0] || [];

        const [inicio, fim] = [new Date(limitesProjeto.first_start), new Date(limitesProjeto.last_end)];

        const ultimosDias = []
        const atual = new Date(inicio.getFullYear(), inicio.getMonth(), 1)

        while (atual <= fim) {
            const ultimoDia = new Date(atual.getFullYear(), atual.getMonth() + 1, 0)
            ultimosDias.push(ultimoDia)
            atual.setMonth(atual.getMonth() + 1)
        }

        const duracaoTotal = fim - inicio;

        const porcentagemExecucaoMensal = ultimosDias.map(data => {
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

        const curvaSGraph = [["Month", "Planned Cost", "Aggregated Value", "Actual Cost"]];
        const curvaStabelaArray = [];

        var gastosMensaisAcumuladosPlano = 0;
        var gastosMensaisAcumulados = 0;
        porcentagemExecucaoMensal.forEach(obj => {
            const mes = obj.mes;
            const valorPlanejado = valoresPlanejadosMensais.find((plano) => 
                plano.month === mes
            ) || { total_a: 0, total_b: 0, month: mes };
            gastosMensaisAcumuladosPlano += ((2 * valorPlanejado.total_a + valorPlanejado.total_b) / 3)
            const gastoNoMes = despesasPorMesArr.find((despesa) => {
                const planoDate = despesa.month.split("-");
                return `${planoDate[0]}/${planoDate[1]}` === mes})?.total || 0;
            
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
                mes: valorPlanejado.month,
                gastoMensal: parseFloat(gastoNoMes.toFixed(2)),
                gastoMensalAcumulado: parseFloat(gastosMensaisAcumulados.toFixed(2)),
                gastoPlanejado: parseFloat(((2 * valorPlanejado.total_a + valorPlanejado.total_b) / 3).toFixed(2)),
                gastoPlanejadoAcumulado: parseFloat(gastosMensaisAcumuladosPlano.toFixed(2)),
                valorAgregado: parseFloat(valorAgregado.toFixed(2))
            })
        })

        setCurvaS(curvaSGraph);
        setCurvaSTabela(curvaStabelaArray);


        //------------------------------------------------KPIs TABLE--------------------------------------------------
        const kpis = valoresPlanejadosAreas.map(vp => {
            const area = vp.area_id;

            const comparacao = porcentagensDeExecucao.find(c => c.area_id === area);
            const despesa = despesasPorArea.find(d => d.area_id === area);

            const valorPlanejado = parseFloat((vp.total_a * 2 + vp.total_b) / 3).toFixed(2);
            const porcentagem = comparacao ? comparacao.porcentagem : 0;
            const custoReal = despesa ? despesa.total.toFixed(2) : 0;
            const valorAgregado = valorPlanejado * (porcentagem / 100);

            return {
                area: vp.area_name,
                valorPlanejado,
                custoReal,
                porcentagem,
                valorAgregado
            };
        });
        setKpis(kpis);
        setLoading(false)
    }

    //---------------------------------------------------GRAPH MEMOS-----------------------------------------------------
    //gerar Array do grafico de pizza Receitas Por Area
    const ReceitasPorAreaGraph = useMemo(() => {
        if (receitasPorArea.length === 0) return [['Area', 'Value']];
        const graph = [['Area', 'Value']];
        receitasPorArea.forEach((area) => {
        graph.push([area.area_name, area.total]);
        });
        return graph;
    }, [receitasPorArea]);

    //gerar Array do grafico de pizza Despesas por Area
    const DespesasPorAreaGraph = useMemo(() => {
        if (despesasPorArea.length === 0) return [['Area', 'Value']];
        const graph = [['Area', 'Value']];
        despesasPorArea.forEach((area) => {
        graph.push([area.area_name, area.total]);
        });
        return graph;
    }, [despesasPorArea]);

    //gerar Array do grafico de colunas de valores por area
    const ValoresPorAreaGraph = useMemo(() => {
        if (receitasPorArea.length == 0 || despesasPorArea.length == 0) return [['Area', 'Revenue', 'Expense']]
        const graph = [['Area', 'Revenue', 'Expense']];
        const areasGanhos = new Set(receitasPorArea.map((receitaArea) => receitaArea.area_name));
        const areasGastos = new Set(despesasPorArea.map((despesaArea) => despesaArea.area_name));
        const todasAreas = Array.from(new Set([...areasGanhos, ...areasGastos]));

        todasAreas.forEach((areaNome) => {
        const receitaArea = receitasPorArea.find((receita) => receita.area_name === areaNome);
        const receitaValor = receitaArea?.total || 0;

        const despesaArea = despesasPorArea.find((despesa) => despesa.area_name === areaNome);
        const despesaValor = despesaArea?.total || 0;

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
    
        const mesesGanhos = new Set(receitasPorMes.map((receitaMes) => receitaMes.month));
        const mesesGastos = new Set(despesasPorMes.map((despesaMes) => despesaMes.month));
        const todosMeses = sortBy(Array.from(new Set([...mesesGanhos, ...mesesGastos])));
        todosMeses.forEach((mesNome) => {
          const receitaMes = receitasPorMes.find((receita) => receita.month === mesNome);
          const receitaValor = receitaMes?.total || 0;
    
          const despesaMes = despesasPorMes.find((despesa) => despesa.month === mesNome);
          const despesaValor = despesaMes?.total || 0;
    
          const saldoMes = receitaValor - despesaValor;
    
          saldoAcumulado += saldoMes;
          gastosAcumulados += despesaValor;
    
          const dateParts = mesNome.split('-');
          const formattedDate = `${dateParts[0]}/${dateParts[1]}`;
    
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

    const fetchCores = async () => {
        const data = await handleFetch({
            table: "wbs_area",
            query: 'colors',
            token
        });
        var cores = {};
        data.data.forEach((area) => {
            cores = { ...cores, [area.name]: area.color || ''}
        })
        setCores(cores);
  }

    useEffect(() => {
        fetchCores();
        fetchResumos();
    }, []);

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
          <span className={custom_span}>Total cost:<br />R${Number(despesasTotais).toFixed(2)}</span>
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
                  color: cores[row[0]] || '#ccc',
                })),
                pieSliceTextStyle: {
                  color: 'black',
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
}

export default Resumo;