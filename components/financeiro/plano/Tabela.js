import React, { useEffect, useState } from 'react';
import styles from '../../../styles/modules/radio.module.css';
import CadastroInputs from './CadastroInputs';
import Loading from '../../Loading';
import Modal from '../../Modal';
import tabela from '../../../styles/modules/tabelaGrande.module.css'
import { jsDateToEuDate, euDateToIsoDate, cleanForm } from '../../../functions/general';
import { fetchData, handleDelete, handleUpdate } from '../../../functions/crud';

const Tabela = () => {
  const [planos, setPlanos] = useState([]);
  const [elementosWBS, setElementosWBS] = useState([]);
  const [itensPorArea, setItensPorArea] = useState([]);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
  const [confirmUpdateItem, setConfirmUpdateItem] = useState(null);
  const [view, setView] = useState('Ideal scenario');
  const [viewUsage, setViewUsage] = useState(true);
  const [exibirModal, setExibirModal] = useState(null);
  const [loading, setLoading] = useState(true);
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

  const fetchElementos = async () => {
    const data = await fetchData('wbs/get');
    setElementosWBS(data.elementos);
  };

  const handleAreaChange = (e) => {
    const areaSelecionada = e.target.value;
    const itensDaArea = elementosWBS.filter(item => item.area === areaSelecionada).map(item => item.item);
    setItensPorArea(itensDaArea);

    setNovoSubmit({
      ...novoSubmit,
      area: areaSelecionada,
      item: '',
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateClick = (item) => {
    setConfirmUpdateItem(item);
    setFormData({
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
    });
  };

  const handleUpdateItem = async (e) => {
    e.preventDefault();

    if (confirmUpdateItem) {
      const updatedItem = { ...confirmUpdateItem, ...formData };
      const updatedPlanos = planos.map(item =>
        item._id === updatedItem._id ? {
          ...formData,
          data_inicial: jsDateToEuDate(updatedItem.data_inicial),
          data_esperada: jsDateToEuDate(updatedItem.data_esperada),
          data_limite: jsDateToEuDate(updatedItem.data_limite),
        } : item
      );
      setPlanos(updatedPlanos);
      setConfirmUpdateItem(null);
      try {
        await handleUpdate({
          route: 'financeiro/plano',
          dados: updatedItem,
          item: confirmUpdateItem
        });
      } catch (error) {
        setPlanos(planos);
        setConfirmUpdateItem(confirmUpdateItem);
        console.error("Update failed:", error);
      }
    }
    cleanForm(formData, setFormData);
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

  const updateInputItem = (areaSelecionadaDp) => {
    const itensDaArea = elementosWBS.filter(item => item.area === areaSelecionadaDp).map(item => item.item);
    setItensPorArea(itensDaArea);

    const novoItemSelecionado = itensDaArea.includes(novoSubmit.item) ? novoSubmit.item : '';

    setNovoSubmit(prevState => ({
      ...prevState,
      area: areaSelecionadaDp,
      item: novoItemSelecionado,
    }));
  };

  useEffect(() => {
    fetchPlanos();
    fetchElementos();
    if (novoSubmit.area) {
      updateInputItem(novoSubmit.area);
    }
  }, [novoSubmit.area]);

  const enviar = async (e) => {
    const plano = view === 'Ideal scenario' ? 'Ideal scenario' : 'Worst Scenario';
    e.preventDefault();
    const updatedNovoSubmit = {
      ...novoSubmit,
      plano: plano,
    };
    handleSubmit({
      route: 'financeiro/financas',
      dados: updatedNovoSubmit
    });
    await fetchLancamentos();
    cleanForm(novoSubmit, setNovoSubmit);
  };

  const checkDadosVazios = (campoIsVazio) => {
    if (campoIsVazio) { setExibirModal('inputsVazios'); return };
  }

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
          ('See Essential Scenario'
          ) : (
            'See Ideal Scenario')}
      </button>
      <h3>Ideal Scenario</h3>
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
              <CadastroInputs
                obj={novoSubmit}
                objSetter={setNovoSubmit}
                funcao={enviar}
                dadosVazios={checkDadosVazios}
                tipo='cadastro'
              />
              {planos
                .filter(item => item.plano === view)
                .map((item, index) => (
                  <tr key={index}>
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
                    <td style={{ width: '75px' }}>
                      <div className="botoes-acoes">
                        <button style={{ color: 'red' }} onClick={() => setConfirmDeleteItem(item)}>❌</button>
                        <button onClick={() => handleUpdateClick(item)}>⚙️</button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>


      <div className="centered-container">
        {confirmDeleteItem && (
          <Modal objeto={{
            titulo: `Are you sure you want to delete the plan for "${confirmDeleteItem.recurso}"?`,
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

        {exibirModal == 'inputsVazios' && (
          <Modal objeto={{
            titulo: 'Fill out all fields before adding new data!',
            botao1: {
              funcao: () => setExibirModal('null'), texto: 'Okay'
            },
          }} />
        )}

        {confirmUpdateItem && (
          <div className="overlay">
            <div className="modal">
              <div className="centered-container financeiro">
                <form onSubmit={handleUpdateItem}>
                  <div >
                    <div className={styles.containerPai}>
                      <label className={styles.container}>
                        <input
                          type="radio"
                          name="plano"
                          value="Worst scenario"
                          checked={formData.plano === 'Worst scenario'}
                          onChange={handleChange}

                        />
                        <span className={styles.checkmark}></span>
                        Essential scenario
                      </label>
                      <label className={styles.container}>
                        <input
                          type="radio"
                          name="plano"
                          value="Ideal scenario"
                          checked={formData.plano === 'Ideal scenario'}
                          onChange={handleChange}

                        />
                        <span className={styles.checkmark}></span>
                        Ideal scenario
                      </label>
                    </div>

                    <div className='centered-container'>
                      <label htmlFor="recurso">Resource</label>
                      <input
                        type="text"
                        name="recurso"
                        placeholder=""
                        onChange={handleChange}
                        value={formData.recurso}

                      />
                    </div>

                    <div className="input-data" style={{ width: '100%' }}>
                      <button type='button'
                        style={{ width: '16rem' }}
                        onClick={() => setViewUsage(!viewUsage)}>
                        {viewUsage ?
                          ('Change to Acquisition Planning'
                          ) : (
                            'Change to Usage Planning')}
                      </button>
                    </div>

                    {viewUsage ? (
                      <div>
                        <div className="centered-container">
                          <label htmlFor="area">Area</label>
                          <select
                            name="area"
                            onChange={handleAreaChange}
                            value={formData.area}

                          >
                            <option value="" disabled>Select an area</option>
                            {[...new Set(elementosWBS.map(item => item.area))].map((area, index) => (
                              <option key={index} value={area}>{area}</option>
                            ))};
                          </select>
                        </div>

                        <div className="centered-container">
                          <label htmlFor="item">Item</label>
                          <select
                            name="item"
                            onChange={handleChange}
                            value={formData.item}

                          >
                            <option value="" disabled>Select an item</option>
                            {itensPorArea.map((item, index) => (
                              <option key={index} value={item}>{item}</option>
                            ))}
                          </select>
                        </div>

                        <div className='centered-container'>
                          <label htmlFor="uso">Use</label>
                          <input
                            type="text"
                            name="uso"
                            placeholder=""
                            onChange={handleChange}
                            value={formData.uso}

                          />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className='centered-container'>
                          <label htmlFor="plano_a">Plan A</label>
                          <input
                            type="text"
                            name="plano_a"
                            onChange={handleChange}
                            value={formData.plano_a}

                          />
                        </div>

                        <div className={styles.containerPai}>
                          <label className={styles.container}>
                            <input
                              type="radio"
                              name="tipo_a"
                              value="Service"
                              checked={formData.tipo_a === 'Service'}
                              onChange={handleChange}

                            />
                            <span className={styles.checkmark}></span>
                            Service
                          </label>
                          <label className={styles.container}>
                            <input
                              type="radio"
                              name="tipo_a"
                              value="Product"
                              checked={formData.tipo_a === 'Product'}
                              onChange={handleChange}

                            />
                            <span className={styles.checkmark}></span>
                            Product
                          </label>
                        </div>

                        <div className='centered-container'>
                          <label htmlFor="valor_a">Value</label>
                          <input
                            type="number"
                            name="valor_a"
                            onChange={handleChange}
                            value={formData.valor_a}

                          />
                        </div>

                        <div className="container-inputs-pequenins">
                          <div className='centered-container input-pequenin'>
                            <label htmlFor="data_inicial">Starting date</label>
                            <input
                              className="input-pequenin"
                              type="date"
                              name="data_inicial"
                              onChange={handleChange}
                              value={formData.data_inicial}

                            />
                          </div>

                          <div className='centered-container input-pequenin'>
                            <label htmlFor="data_esperada">Expected date</label>
                            <input
                              type="date"
                              name="data_esperada"
                              onChange={handleChange}
                              value={formData.data_esperada}

                            />
                          </div>

                          <div className='centered-container input-pequenin'>
                            <label htmlFor="data_limite">Critical date</label>
                            <input
                              type="date"
                              name="data_limite"
                              onChange={handleChange}
                              value={formData.data_limite}

                            />
                          </div>
                        </div>


                        <div className='centered-container'>
                          <label htmlFor="plano_b">Plan B</label>
                          <input
                            type="text"
                            name="plano_b"
                            onChange={handleChange}
                            value={formData.plano_b}

                          />
                        </div>

                        <div className={styles.containerPai}>
                          <label className={styles.container}>
                            <input
                              type="radio"
                              name="tipo_b"
                              value="Service"
                              checked={formData.tipo_b === 'Service'}
                              onChange={handleChange}

                            />
                            <span className={styles.checkmark}></span>
                            Service
                          </label>
                          <label className={styles.container}>
                            <input
                              type="radio"
                              name="tipo_b"
                              value="Product"
                              checked={formData.tipo_b === 'Product'}
                              onChange={handleChange}

                            />
                            <span className={styles.checkmark}></span>
                            Product
                          </label>
                        </div>

                        <div className='centered-container'>
                          <label htmlFor="valor_b">Value</label>
                          <input
                            type="number"
                            name="valor_b"
                            onChange={handleChange}
                            value={formData.valor_b}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <button className="botao-cadastro" type="submit">Update</button>
                  <button className="botao-cadastro" type="button" onClick={() => setConfirmUpdateItem(null)}>Cancel</button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tabela;