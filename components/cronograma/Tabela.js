import React, { useEffect, useState, useContext, useMemo } from 'react';
import Loading from '../Loading';
import Modal from '../Modal';
import { Chart } from 'react-google-charts';
import { fetchData, handleDelete, handleUpdate, handleSubmit } from '../../functions/crud';
import { cleanForm, jsDateToEuDate, euDateToIsoDate, euDateToJsDate } from '../../functions/general';
import styles from '../../styles/modules/cronograma.module.css';
import CadastroInputs from './CadastroInputs';
import chroma from 'chroma-js';
import { AuthContext } from "../../contexts/AuthContext";
import { set } from 'lodash';

const Tabela = () => {
  const [cronogramas, setCronogramas] = useState([]);
  const [cronogramasCont, setCronogramasCont] = useState([]);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
  const [exibirModal, setExibirModal] = useState(null);
  const [confirmUpdateItem, setConfirmUpdateItem] = useState(null);
  const [chartHeight, setChartHeight] = useState('100px');
  const [chartDataLoaded, setChartDataLoaded] = useState(false);
  const [linhaVisivel, setLinhaVisivel] = useState({});
  const [reload, setReload] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cores, setCores] = useState({});
  const camposVazios = {
    item: '',
    area: '',
    inicio: '',
    termino: '',
    dp_item: '',
    dp_area: '',
  }
  const [novosDados, setNovosDados] = useState(camposVazios);
  const [novoSubmit, setNovoSubmit] = useState(camposVazios);
  const { isAdmin } = useContext(AuthContext);
  const [paleta, setPaleta] = useState([]);
  const [etis, setEtis] = useState([]);
  const [showContingencies, setShowContingencies] = useState(false);
  const [tabela, setTabela] = useState([]);


  //funcao que recebe o item a ser atualizado e insere os campos relevantes em novosDados
  const handleUpdateClick = (item) => {
    setConfirmUpdateItem(item);
    setNovosDados({
      plano: true,
      inicio: euDateToIsoDate(item.inicio),
      termino: euDateToIsoDate(item.termino),
      dp_item: item.dp_item || undefined,
      dp_area: item.dp_area || undefined,
      situacao: item.situacao,
    });
  };


  //funcao que deleta o item tanto no plano quanto no monitoramento
  const handleConfirmDelete = async () => {
    setConfirmDeleteItem(null);
    if (confirmDeleteItem) {
      var getDeleteSuccess = false;
      try {
        getDeleteSuccess = await handleDelete({
          route: 'cronograma',
          item: confirmDeleteItem,
          fetchDados: fetchCronogramas
        });
        try {
          await fetch(`/api/cronograma/deleteByName`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ area: confirmDeleteItem.area, item: confirmDeleteItem.item }),
          });
        } catch (error) {
          console.error(`Erro ao deletar`, error);
        }
      } finally {
        setDeleteSuccess(getDeleteSuccess);
      }
    }
    setReload(true);
  };


  //funcao para somar dias a uma data
  function adicionarDias(data, dias) {
    if (dias) {
      const novaData = new Date(data);
      novaData.setDate(novaData.getDate() + dias);
      return novaData;
    }
    return data;
  }


  //funcao para criar os dados que entram no grafico gantt, tanto o normal quanto o de contingencia
  const createGanttData = () => {
    const ganttData = [['Task ID', 'Task Name', 'Resource', 'Start Date', 'End Date', 'Duration', 'Percent Complete', 'Dependencies']];
    const ganttDataContingency = [['Task ID', 'Task Name', 'Resource', 'Start Date', 'End Date', 'Duration', 'Percent Complete', 'Dependencies']];

    cronogramas.forEach((item) => {
      if (item.plano) {
        var dependencies = ''
        const taskID = `${item.area}_${item.item}`;
        const taskName = item.item;
        const resource = item.area;
        const startDate = euDateToJsDate(item.inicio);
        const endDate = euDateToJsDate(item.termino);
        if (!item.dp_area && !item.dp_item) {
          dependencies = null;
        } else {
          dependencies = `${item.dp_area}_${item.dp_item}`;
        }
        ganttData.push([taskID, taskName, resource, startDate, endDate, 10, 100, dependencies]);
        ganttDataContingency.push([taskID, taskName, resource, startDate, adicionarDias(endDate, Math.floor(etis[taskName])), 10, 100, dependencies]);
      }
    });

    return [ganttData, ganttDataContingency];
  };

  //funcao que executa na primeira render e depois so quando cronogramas ou etis atualiza
  //armazenando os dados diretamente nas constantes

  //useMemo ARMAZENA VALOR
  //useEffect REALIZA FUNCOES
  const [chartData, chartDataContingencies] = useMemo(() => {
    if (cronogramas.length === 0) return [[], []];
    return createGanttData();
  }, [cronogramas, etis]);


  //funcao para puxar os dados de cronograma, ETIs e cores, tratando-os e armazenando-os em estados
  const fetchCronogramas = async () => {
    try {
      const data = await fetchData('cronograma/get/planos');
      const dataETIs = await fetchData('riscos/analise/get/etis_per_item');
      const dataCores = await fetchData('wbs/get/cores');

      data.cronogramaPlanos.forEach((item) => {
        item.inicio = jsDateToEuDate(item.inicio);
        item.termino = jsDateToEuDate(item.termino);
      });
      data.cronogramaPlanos.sort((a, b) => {
        if (a.area < b.area) return -1;
        if (a.area > b.area) return 1;
        return 0;
      });

      const cronogramaComContingencias = data.cronogramaPlanos.map(item => ({ ...item }));;
      cronogramaComContingencias.forEach((item) => {
        if (dataETIs.resultadosAgrupados[item.item]) {
          const termino = euDateToJsDate(item.termino)
          const terminoConvertido = adicionarDias(termino, Math.floor(dataETIs.resultadosAgrupados[item.item]));
          item.termino = jsDateToEuDate(terminoConvertido);
        }
      })

      //adicionar cores na tabela
      var cores = {};
      dataCores.areasECores.forEach((area) => {
        cores = { ...cores, [area._id]: area.cor[0] ? area.cor[0] : '' }
      })

      //adicionar cores no grafico (apenas as cores de areas que tem alguma coisa sendo executada)
      var paleta = [];
      for (const [key, value] of Object.entries(cores)) {
        if (data.cronogramaPlanos.some((item) => item.area === key && item.termino !== null)) {
          paleta.push({
            "color": value ? chroma(value).darken().saturate(3).hex() : '#000000',
            "dark": value ? chroma(value).hex() : '#000000',
            "light": value ? chroma(value).darken().hex() : '#000000'
          })
        }
      }

      setCores(cores);
      setPaleta(paleta);
      setEtis(dataETIs.resultadosAgrupados);
      setCronogramas(data.cronogramaPlanos);
      setCronogramasCont(cronogramaComContingencias);
      setTabela(data.cronogramaPlanos);
    } finally {
      setLoading(false);
    }
  };

  const modalLabels = {
    'inputsVazios': 'Fill out all fields before adding new data!',
    'dadosUsados': 'This item is already registered in the timelines!',
    'depFaltando': 'Please select the dependencies correctly!',
    'dpNotRegistered': "The item you've selected as predecessor is not registered!",
    'dpNotOkay': "The predecessor must finish before the successor starts!",
    'datasErradas': 'The finishing date must be after the starting date!'
  };


  //useEffect que só executa as funcoes quando reload atualiza
  useEffect(() => {
    if(reload == true){
      setReload(false);
      fetchCronogramas();
    }
  }, [reload]);


  //useEffect que so roda na primeira execucao
  useEffect(() => {
    fetchCronogramas();
  }, []);


  //useEffect que só executa quando chartData recebe um valor para calcular o tamanho do grafico
  useEffect(() => {
    if (chartData.length > 1) {
      const linhaHeight = 30;
      const novaAltura = ((chartData.length * linhaHeight) + 50) + 'px';
      setChartHeight(novaAltura);
      setChartDataLoaded(true);
    }
  }, [chartData]);


  //funcao que cadastra o plano e o monitoramento, com os dados vazios
  const enviar = async (e) => {
    e.preventDefault();
    const formDataPlano = {
      ...novoSubmit,
      plano: true,
      situacao: 'concluida'
    };

    const formDataGantt = {
      ...novoSubmit,
      plano: false,
      inicio: null,
      termino: null,
      situacao: 'iniciar'
    };
    await handleSubmit({
      route: 'cronograma',
      dados: formDataPlano,
    });
    await handleSubmit({
      route: 'cronograma',
      dados: formDataGantt,
    });
    cleanForm(novoSubmit, setNovoSubmit, camposVazios);
    window.location.reload();
  };

  //funcao que trata os dados e atualiza o plano
  const handleUpdateItem = async () => {
    if (confirmUpdateItem) {
      const updatedItem = {
        ...confirmUpdateItem,
        ...novosDados
      };

      const updatedCronogramas = cronogramas.map(item =>
        item._id === updatedItem._id ? {
          ...updatedItem,
          inicio: jsDateToEuDate(updatedItem.inicio),
          termino: jsDateToEuDate(updatedItem.termino)
        } : item
      );
      setCronogramas(updatedCronogramas);
      setConfirmUpdateItem(null);

      try {
        await handleUpdate({
          route: 'cronograma',
          dados: updatedItem,
          item: confirmUpdateItem
        });
      } catch (error) {
        setCronogramas(cronogramas);
        setConfirmUpdateItem(confirmUpdateItem);
        console.error("Update failed:", error);
      }
    }
    setConfirmUpdateItem(null);
    cleanForm(novosDados, setNovosDados, camposVazios);
    setLinhaVisivel();
    setReload(true);
  };

  
  //funcao que calcula o rowSpan do td da area de acordo com os itens 
  const calculateRowSpan = (itens, currentArea, currentIndex) => {
    let rowSpan = 1;
    for (let i = currentIndex + 1; i < itens.length; i++) {
      if (itens[i].area === currentArea) {
        rowSpan++;
      } else {
        break;
      }
    }
    return rowSpan;
  };

  return (
    <div className="centered-container">
      {loading && <Loading />}
      <h2>Estimated timeline</h2>
      {confirmDeleteItem && (
        <div className="overlay">
          <div className="modal">
            <p>Are you sure you want to delete "{confirmDeleteItem.area} - {confirmDeleteItem.item}"?</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="botao-padrao" onClick={handleConfirmDelete}>Confirm</button>
              <button className="botao-padrao" onClick={() => setConfirmDeleteItem(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {deleteSuccess && (
        <div className="overlay">
          <div className="modal">
            <p>{deleteSuccess ? 'Deletion successful!' : 'Deletion failed.'}</p>
            <button className="botao-padrao" onClick={() => setDeleteSuccess(false)}>Close</button>
          </div>
        </div>
      )}

      {exibirModal != null && (
        <Modal objeto={{
          titulo: modalLabels[exibirModal],
          botao1: {
            funcao: () => setExibirModal(null), texto: 'Okay'
          },
        }} />
      )}

      <button className="botao-bonito" style={{ width: '11rem' }} onClick={() => {
        setShowContingencies(!showContingencies);
        showContingencies ? setTabela(cronogramas) : setTabela(cronogramasCont);
      }}
      >{!showContingencies ? `Show contingencies` : `Hide contingencies`}</button>

      {chartDataLoaded && (
        <Chart
          height={chartHeight}
          width={'90%'}
          chartType="Gantt"
          loader={<div>Loading Chart</div>}
          data={!showContingencies ? chartData : chartDataContingencies}
          options={{
            gantt: {
              trackHeight: 30,
              sortTasks: false,
              palette: paleta,
              shadowEnabled: false,
              criticalPathEnabled: false,
            },
          }}
        />
      )}

      <div className="centered-container">
        <div className={styles.tabelaCronograma_container}>
          <div className={styles.tabelaCronograma_wrapper}>
            <table style={{ marginBottom: '10px' }} className={styles.tabelaCronograma}>
              <thead>
                <tr>
                  <th>Area</th>
                  <th>Task</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Dependency: Area</th>
                  <th>Dependency: Item</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <CadastroInputs
                    obj={{ ...novoSubmit, plano: true }}
                    objSetter={setNovoSubmit}
                    tipo='cadastro'
                    funcao={enviar}
                    setExibirModal={setExibirModal}
                  />
                </tr>
                {tabela.filter((item) => item.plano).map((item, index) => (
                  <tr key={index} style={{ backgroundColor: cores[item.area] }}>
                    <React.Fragment>
                      {index === 0 || cronogramas[index - 1].area !== item.area ? (
                        <td rowSpan={calculateRowSpan(cronogramas, item.area, index)}
                        >{item.area}</td>
                      ) : null}
                      <td>
                        {item.item}
                      </td>
                      {linhaVisivel === item._id ? (
                        <CadastroInputs
                          tipo="update"
                          obj={novosDados}
                          objSetter={setNovosDados}
                          setExibirModal={setExibirModal}
                          funcao={{
                            funcao1: () => handleUpdateItem(),
                            funcao2: () => linhaVisivel === item._id ? setLinhaVisivel() : setLinhaVisivel(item._id)
                          }}
                        />
                      ) : (
                        <React.Fragment>
                          <td>{item.inicio}</td>
                          <td>{item.termino}</td>
                          <td>{item.dp_area || '-'}</td>
                          <td>{item.dp_item || '-'}</td>
                          <td>
                            <div className="botoes_acoes">
                              <button onClick={() => setConfirmDeleteItem(item)}
                                disabled={!isAdmin}>❌</button>
                              <button onClick={() => {
                                linhaVisivel === item._id ? setLinhaVisivel() : setLinhaVisivel(item._id); handleUpdateClick(item)
                              }}
                                disabled={!isAdmin}>⚙️</button>
                            </div>
                          </td>
                        </React.Fragment>
                      )}
                    </React.Fragment>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Tabela;