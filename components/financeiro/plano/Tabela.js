import React, { useEffect, useState } from 'react';
import CadastroInputs from './CadastroInputs';
import Loading from '../../Loading';
import Modal from '../../Modal';
import tabela from '../../../styles/modules/tabelaGrande.module.css'
import { jsDateToEuDate, euDateToIsoDate, cleanForm } from '../../../functions/general';
import { fetchData, handleDelete, handleUpdate, handleSubmit } from '../../../functions/crud';

const Tabela = () => {
  const [planos, setPlanos] = useState([]);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
  const [confirmUpdateItem, setConfirmUpdateItem] = useState(null);
  const [view, setView] = useState('Ideal scenario');
  const [linhaVisivel, setLinhaVisivel] = useState({});
  const [exibirModal, setExibirModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(false);
  const camposVazios = {
    plano: '',
    area: '',
    item: '',
    recurso: '',
    uso: '',
    tipo_a: '',
    valor_a: '',
    plano_a: '',
    data_inicial: '',
    data_esperada: '',
    data_limite: '',
    plano_b: '',
    tipo_b: '',
    valor_b: ''
  }
  const [novoSubmit, setNovoSubmit] = useState(camposVazios);
  const [novosDados, setNovosDados] = useState(camposVazios);

  const handleUpdateClick = (item) => {
    setConfirmUpdateItem(item);
    const obj = {
      _id: item._id,
      plano: item.plano,
      area: item.area,
      item: item.item,
      recurso: item.recurso,
      uso: item.uso,
      tipo_a: item.tipo_a,
      valor_a: item.valor_a,
      plano_a: item.plano_a,
      data_inicial: euDateToIsoDate(item.data_inicial),
      data_esperada: euDateToIsoDate(item.data_esperada),
      data_limite: euDateToIsoDate(item.data_limite),
      plano_b: item.plano_b,
      tipo_b: item.tipo_b,
      valor_b: item.valor_b
    }
    setNovosDados(obj);
  };

  const handleUpdateItem = async () => {
    if (confirmUpdateItem) {
      const updatedItem = { ...confirmUpdateItem, ...novosDados };
      const updatedPlanos = planos.map(item =>
        item._id === updatedItem._id ? {
          ...novosDados,
          data_inicial: jsDateToEuDate(updatedItem.data_inicial),
          data_esperada: jsDateToEuDate(updatedItem.data_esperada),
          data_limite: jsDateToEuDate(updatedItem.data_limite),
        } : item
      );
      setPlanos(updatedPlanos);
      setConfirmUpdateItem(null);
      linhaVisivel === confirmUpdateItem._id ? setLinhaVisivel() : setLinhaVisivel(confirmUpdateItem._id);
      try {
        await handleUpdate({
          route: 'financeiro/plano/update?id',
          dados: updatedItem,
          item: confirmUpdateItem
        });
      } catch (error) {
        setPlanos(planos);
        setConfirmUpdateItem(confirmUpdateItem);
        console.error("Update failed:", error);
      }
    }
    cleanForm(novosDados, setNovosDados);
  };

  const fetchPlanos = async () => {
    try {
      const data = await fetchData('financeiro/plano/get/planos');
      data.planos.forEach((item) => {
        item.data_inicial = jsDateToEuDate(item.data_inicial);
        item.data_esperada = jsDateToEuDate(item.data_esperada);
        item.data_limite = jsDateToEuDate(item.data_limite);
      });
      setPlanos(data.planos);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setReload(false);
    fetchPlanos();
  }, [reload])

  const enviar = async (e) => {
    const plano = view === 'Ideal scenario' ? 'Ideal scenario' : 'Worst scenario';
    e.preventDefault();
    const updatedNovoSubmit = {
      ...novoSubmit,
      plano: plano,
    };
    handleSubmit({
      route: 'financeiro/plano',
      dados: updatedNovoSubmit
    });
    cleanForm(novoSubmit, setNovoSubmit);
    setReload(true);
  };

  const checkDados = (tipo) => {
    setExibirModal(tipo); return;
  };

  const modalLabels = {
    'inputsVazios': 'Fill out all fields before adding new data!',
    'valorNegativo': 'The values cannot be negative!',
    'datasErradas': 'Your starting date is lower than the other dates!',
  };

  const handleConfirmDelete = () => {
    if (confirmDeleteItem) {
      var getDeleteSuccess = false;
      try {
        getDeleteSuccess = handleDelete({
          route: 'financeiro/plano',
          item: confirmDeleteItem,
          fetchDados: fetchPlanos
        });
      } finally {
        setDeleteSuccess(getDeleteSuccess);
      }
    }
    setConfirmDeleteItem(null);
  };

  return (
    <div className="centered-container">
      {loading && <Loading />}
      <h2>Resource Acquisition Plan</h2>
      <button type="button" className={tabela.botao_bonito} onClick={() => setView(view == 'Ideal scenario' ? 'Worst scenario' : 'Ideal scenario')}>
        {view == 'Worst scenario' ?
          ('See Ideal Scenario'
          ) : (
            'See Essential Scenario')}
      </button>
      <h3>{view == 'Worst scenario' ? 'Essential Scenario' : 'Ideal Scenario'}</h3>
      <div className={tabela.tabela_financas_container}>
        <div className={`centered-container ${tabela.tabela_financas_wrapper}`}>
          <table className={tabela.tabela_financas}>
            <thead>
              <tr>
                <th colSpan="4">Basic Info</th>
                <th colSpan="3">Plan A</th>
                <th colSpan="3">Milestones</th>
                <th colSpan="3">Plan B</th>
                <th rowSpan="2">Options</th>
              </tr>
              <tr>
                <th>Area</th>
                <th>Item</th>
                <th>Resource</th>
                <th>Use</th>
                <th>Plan</th>
                <th>Type</th>
                <th>Value</th>
                <th>Starting date</th>
                <th>Expected date</th>
                <th>Critical date</th>
                <th>Plan</th>
                <th>Type</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              
              {planos
                .filter(item => item.plano === view)
                .map((item, index) => (
                  <React.Fragment key={item._id}>
                    {linhaVisivel === item._id ? (
                      <React.Fragment>
                        <CadastroInputs
                        obj={novosDados}
                        objSetter={setNovosDados} funcao={{
                          funcao1: () => handleUpdateItem(),
                          funcao2: () => linhaVisivel === item._id ? setLinhaVisivel() : setLinhaVisivel(item._id)
                        }}
                        checkDados={checkDados}
                        tipo='update' />
                      </React.Fragment>

                    ) : (
                      <React.Fragment>
                        <tr>
                          <td>{item.area || '-'}</td>
                          <td>{item.item || '-'}</td>
                          <td>{item.recurso || '-'}</td>
                          <td>{item.uso || '-'}</td>
                          <td>{item.plano_a || '-'}</td>
                          <td>{item.tipo_a || '-'}</td>
                          <td>{item.valor_a ? `R$${item.valor_a}` : '-'}</td>
                          <td>{item.data_inicial !== '01/01/1970' ? item.data_inicial : '-'}</td>
                          <td>{item.data_esperada !== '01/01/1970' ? item.data_esperada : '-'}</td>
                          <td>{item.data_limite !== '01/01/1970' ? item.data_limite : '-'}</td>
                          <td>{item.plano_b || '-'}</td>
                          <td>{item.tipo_b || '-'}</td>
                          <td>{item.valor_b ? `R$${item.valor_b}` : '-'}</td>
                          <td>
                            <div className="botoes_acoes">
                              <button style={{ color: 'red' }} onClick={() => setConfirmDeleteItem(item)}>❌</button>
                              <button onClick={() => {
                                linhaVisivel === item._id ? setLinhaVisivel() : setLinhaVisivel(item._id); handleUpdateClick(item)
                              }}>⚙️</button>
                            </div>
                          </td>
                        </tr>
                      </React.Fragment>
                    )}
                  </React.Fragment>
                ))}
                <CadastroInputs
                obj={novoSubmit}
                objSetter={setNovoSubmit}
                funcao={enviar}
                checkDados={checkDados}
                tipo='cadastro'
              />
            </tbody>
          </table>
        </div>
      </div>

      <div className="centered-container">
        {confirmDeleteItem && (
          <Modal objeto={{
            titulo: `Are you sure you want to PERMANENTLY delete "${confirmDeleteItem.recurso}"?`,
            alerta: true,
            botao1: {
              funcao: handleConfirmDelete, texto: 'Confirm'
            },
            botao2: {
              funcao: () => setConfirmDeleteItem(null), texto: 'Cancel'
            }
          }} />
        )}

        {deleteSuccess && (
          <Modal objeto={{
            titulo: deleteSuccess ? 'Deletion successful!' : 'Deletion failed.',
            botao1: {
              funcao: () => setDeleteSuccess(false), texto: 'Close'
            },
          }} />
        )}

        {exibirModal != null && (
          <Modal objeto={{
            titulo: modalLabels[exibirModal],
            botao1: {
              funcao: () => setExibirModal(null), texto: 'Okay'
            },
          }} />
        )}
      </div>
    </div>
  );
};

export default Tabela;