import React, { useEffect, useState } from 'react';
import Loading from '../Loading';
import Modal from '../Modal';
import { Chart } from 'react-google-charts';
import { fetchData, handleDelete, handleUpdate, handleSubmit } from '../../functions/crud';
import { cleanForm, jsDateToEuDate, euDateToIsoDate, euDateToJsDate } from '../../functions/general';
import styles from '../../styles/modules/cronograma.module.css';
import CadastroInputs from './CadastroInputs';

const Tabela = () => {
  const [cronogramas, setCronogramas] = useState([]);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
  const [exibirModal, setExibirModal] = useState(null);
  const [confirmUpdateItem, setConfirmUpdateItem] = useState(null);
  const [chartHeight, setChartHeight] = useState('100px');
  const [chartDataLoaded, setChartDataLoaded] = useState(false);
  const [linhaVisivel, setLinhaVisivel] = useState({});
  const [reload, setReload] = useState(false);
  const [loading, setLoading] = useState(true);
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

  const handleUpdateItem = async () => {
    if (confirmUpdateItem) {
      const updatedItem = {
        ...confirmUpdateItem,
        ...novosDados,
        inicio: novosDados.inicio,
        termino: novosDados.termino
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
    cleanForm(novosDados, setNovosDados);
    setLinhaVisivel();
  };

  const handleUpdateClick = (item) => {
    setConfirmUpdateItem(item);
    setNovosDados({
      inicio: euDateToIsoDate(item.inicio),
      termino: euDateToIsoDate(item.termino),
      dp_item: item.dp_item || undefined,
      dp_area: item.dp_area || undefined,
      situacao: item.situacao,
    });
  };

  const handleConfirmDelete = () => {
    setConfirmDeleteItem(null);
    if (confirmDeleteItem) {
      var getDeleteSuccess = false;
      try {
        getDeleteSuccess = handleDelete({
          route: 'cronograma',
          item: confirmDeleteItem,
          fetchDados: fetchCronogramas
        });
      } finally {
        setDeleteSuccess(getDeleteSuccess);
      }
    }
  };

  const createGanttData = (cronogramas) => {
    const ganttData = [['Task ID', 'Task Name', 'Resource', 'Start Date', 'End Date', 'Duration', 'Percent Complete', 'Dependencies']];

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
      }
    });

    return ganttData;
  };
  const chartData = createGanttData(cronogramas);

  const checkIfUsed = async (item) => {
    var found;
    await fetch(`/api/cronograma/checks/isUsed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ area: item.area, item: item.item }),
    })

      .then(response => response.json()).then(data => { found = data.found });
    console.log({ area: item.area, item: item.item })
    return found;
  }

  const checkDpUsed = async (item) => {
    var found;
    await fetch(`/api/cronograma/checks/dpIsUsed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ dp_area: item.dp_area, dp_item: item.dp_item }),
    })

      .then(response => response.json()).then(data => { found = data.found });
    console.log({ area: item.area, item: item.item })
    return found;
  }

  const fetchCronogramas = async () => {
    try {
      const data = await fetchData('cronograma/get/planos');
      data.cronogramaPlanos.forEach((item) => {
        item.inicio = jsDateToEuDate(item.inicio);
        item.termino = jsDateToEuDate(item.termino);
      });
      data.cronogramaPlanos.sort((a, b) => {
        if (a.area < b.area) return -1;
        if (a.area > b.area) return 1;
        return 0;
      });
      setCronogramas(data.cronogramaPlanos);
    } finally {
      setLoading(false);
    }
  };

  const checkDados = (tipo) => {
    setExibirModal(tipo); return;
  };
  const modalLabels = {
    'inputsVazios': 'Fill out all fields before adding new data!',
    'dadosUsados': 'This item is already registered in the timelines!',
    'depFaltando': 'Please select the dependencies correctly!',
    'dpNotUsed': "The item you've selected as dependency is not registered!"
  };

  useEffect(() => {
    setReload(false);
    fetchCronogramas();
  }, [reload]);

  useEffect(() => {
    if (chartData.length > 1) {
      const linhaHeight = 30;
      const novaAltura = ((chartData.length * linhaHeight) + 50) + 'px';
      setChartHeight(novaAltura);
      setChartDataLoaded(true);
    }
  }, [chartData]);

  const enviar = async (e) => {
    e.preventDefault();
    console.log(novoSubmit);
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
    const isUsed = await checkIfUsed(novoSubmit);
    const dpIsUsed = await checkDpUsed(novoSubmit);
    if (novoSubmit.dp_area !== '' || novoSubmit.dp_item !== '') {
      if (!dpIsUsed) {
        setExibirModal('dpNotUsed');
        return;
      }
    }
    if (isUsed) {
      setExibirModal('dadosUsados');
      return;
    }
    handleSubmit({
      route: 'cronograma',
      dados: formDataPlano,
    });
    handleSubmit({
      route: 'cronograma',
      dados: formDataGantt,
    });
    cleanForm(novoSubmit, setNovoSubmit);
    setReload(true);
  };

  return (
    <div className="centered-container">
      {loading && <Loading />}
      <h2>Estimated timeline</h2>
      {confirmDeleteItem && (
        <div className="overlay">
          <div className="modal">
            <p>Are you sure you want to delete "{confirmDeleteItem.item}"?</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="botao-cadastro" onClick={handleConfirmDelete}>Confirm</button>
              <button className="botao-cadastro" onClick={() => setConfirmDeleteItem(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {deleteSuccess && (
        <div className="overlay">
          <div className="modal">
            <p>{deleteSuccess ? 'Deletion successful!' : 'Deletion failed.'}</p>
            <button className="botao-cadastro" onClick={() => setDeleteSuccess(false)}>Close</button>
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

      {chartDataLoaded && (
        <Chart
          height={chartHeight}
          width={'90%'}
          chartType="Gantt"
          loader={<div>Loading Chart</div>}
          data={chartData}
          options={{
            gantt: {
              trackHeight: 30,
              sortTasks: false,
            },
          }}
        />
      )}

      <div className={styles.tabelaCronograma_container}>
        <div className={styles.tabelaCronograma_wrapper}>
          <table style={{ marginBottom: '10px' }} className={styles.tabelaCronograma}>
            <thead>
              <tr>
                <th>Area</th>
                <th>Task</th>
                <th>Start</th>
                <th>End</th>
                <th style={{ width: '11%' }}>Dependency: Area</th>
                <th style={{ width: '11%' }}>Dependency: Item</th>
                <th style={{ width: '5%' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <CadastroInputs
                  obj={novoSubmit}
                  objSetter={setNovoSubmit}
                  tipo='cadastro'
                  funcao={enviar}
                  checkDados={checkDados}
                />
              </tr>
              {cronogramas.filter((item) => item.plano).map((item, index) => (
                <tr key={index}>
                  <React.Fragment>
                    <td>
                      {item.area}
                    </td>
                    <td>
                      {item.item}
                    </td>
                    {linhaVisivel === item._id ? (
                      <CadastroInputs
                        tipo="update"
                        obj={novosDados}
                        objSetter={setNovosDados}
                        checkDados={checkDados}
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
                          <div className="botoes-acoes">
                            <button onClick={() => setConfirmDeleteItem(item)}>❌</button>
                            <button onClick={() => {
                              linhaVisivel === item._id ? setLinhaVisivel() : setLinhaVisivel(item._id); handleUpdateClick(item)
                            }}>⚙️</button>
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
  );
};

export default Tabela;