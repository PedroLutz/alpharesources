import React, { useEffect, useState } from 'react';
import Loading from '../../Loading';
import Modal from '../../Modal';
import CadastroInputs from './CadastroInputs';
import styles from '../../../styles/modules/tabela.module.css'
import { handleSubmit, fetchData, handleDelete, handleUpdate, handlePseudoDelete } from '../../../functions/crud';
import { jsDateToEuDate, euDateToIsoDate, cleanForm } from '../../../functions/general';

const labelsTipo = {
  Income: 'Income',
  Expense: 'Cost',
  Exchange: 'Exchange'
};

const Tabela = () => {
  const [lancamentos, setLancamentos] = useState([]);
  const [lancamentosDeletados, setLancamentosDeletados] = useState([]);
  const [dadosTabela, setDadosTabela] = useState({ object: [], isDeletados: null, garbageButtonLabel: 'Garbage bin 🗑️' });
  const [deleteInfo, setDeleteInfo] = useState({ success: null, item: null });
  const [confirmUpdateItem, setConfirmUpdateItem] = useState(null);
  const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
  const [confirmRestoreItem, setConfirmRestoreItem] = useState(null);
  const [exibirModal, setExibirModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [linhasVisiveis, setLinhasVisiveis] = useState({});
  const camposVazios = {
    tipo: '',
    descricao: '',
    valor: '',
    data: '',
    area: '',
    origem: '',
    destino: '',
  }
  const [novoSubmit, setNovoSubmit] = useState(camposVazios);
  const [novosDados, setNovosDados] = useState(camposVazios);

  const isFormVazio = (obj) => {
    const campos = Object.keys(obj);
    for (let i = 0; i < campos.length; i++) {
      if (obj[campos[i]] == '') return true;
    }
  }

  const fetchLancamentos = async () => {
    try {
      const data = await fetchData('financeiro/financas/get/lancamentos');
      data.lancamentos.forEach((item) => {
        item.data = jsDateToEuDate(item.data);
      });
      const [lancamentos, lancamentosDeletados] = data.lancamentos.reduce(
        ([ativos, deletados], item) => {
          if (item.deletado) {
            deletados.push(item);
          } else {
            ativos.push(item);
          }
          return [ativos, deletados];
        },
        [[], []]
      );

      setLancamentos(lancamentos);
      setDadosTabela({ object: lancamentos, isDeletados: false, garbageButtonLabel: 'Garbage bin 🗑️' })
      setLancamentosDeletados(lancamentosDeletados);

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLancamentos();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Enter') {
        enviar(event);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [novoSubmit]);

  const handleConfirmDelete = () => {
    if (deleteInfo.item) {
      var getDeleteSuccess = false;
      try {
        getDeleteSuccess = handleDelete({
          route: 'financeiro/financas',
          item: deleteInfo.item,
          fetchDados: fetchLancamentos
        });
      } finally {
        setDeleteInfo({ success: getDeleteSuccess, item: null })
      }
    }
    setDeleteInfo({ success: getDeleteSuccess, item: null })
  };

  const enviar = async (e) => {
    e.preventDefault();
    const isExpense = novoSubmit.tipo === 'Expense';
    const valor = isExpense ? -parseFloat(novoSubmit.valor) : parseFloat(novoSubmit.valor);
    const updatedNovoSubmit = {
      ...novoSubmit,
      valor: valor
    };
    if (isFormVazio(updatedNovoSubmit)) { setExibirModal('inputsVazios'); return; }
    handleSubmit({
      route: 'financeiro/financas',
      dados: updatedNovoSubmit
    });
    await fetchLancamentos();
    cleanForm(novoSubmit, setNovoSubmit);
  };

  const handleUpdateClick = (item) => {
    let valorCorrigido = 0;
    if (Number(item.valor) < 0) {
      valorCorrigido = item.valor * -1;
    } else {
      valorCorrigido = item.valor;
    }

    setConfirmUpdateItem(item);
    setNovosDados({
      tipo: item.tipo,
      descricao: item.descricao,
      valor: valorCorrigido,
      data: euDateToIsoDate(item.data),
      area: item.area,
      origem: item.origem,
      destino: item.destino,
    });
  };

  const handleUpdateItem = async () => {
    if (confirmUpdateItem) {
      const isExpense = confirmUpdateItem.tipo === "Expense";
      const valorInverso = isExpense ? novosDados.valor * -1 : novosDados.valor;
      const updatedItem = { ...confirmUpdateItem, ...novosDados, valor: valorInverso };

      const updatedLancamentos = lancamentos.map(item =>
        item._id === updatedItem._id ? { ...updatedItem, data: jsDateToEuDate(updatedItem.data) } : item
      );
      setLancamentos(updatedLancamentos);
      setDadosTabela({object: updatedLancamentos, isDeletados: false, garbageButtonLabel: 'Garbage bin 🗑️'});
      setConfirmUpdateItem(null);
      toggleLinhaVisivel(confirmUpdateItem._id)
      try {
        await handleUpdate({
          route: 'financeiro/financas',
          dados: updatedItem,
          item: confirmUpdateItem
        });
      } catch (error) {
        setLancamentos(lancamentos);
        setConfirmUpdateItem(confirmUpdateItem);
        console.error("Update failed:", error);
      }
    }
  };

  const handleRestoreItem = async () => {
    if (confirmRestoreItem) {
      const updatedItem = { ...confirmRestoreItem, deletado: false };

      const index = lancamentosDeletados.indexOf(confirmRestoreItem);
      index > -1 && lancamentosDeletados.splice(index, 1);
      lancamentos.push(updatedItem);

      setLancamentos(lancamentos);
      setLancamentosDeletados(lancamentosDeletados);
      setDadosTabela({ object: lancamentos, isDeletados: false, garbageButtonLabel: 'Garbage bin 🗑️' });
      setConfirmUpdateItem(null);

      await handlePseudoDelete({
        route: 'financeiro/financas',
        item: confirmRestoreItem,
        deletar: false
      });
    }
  }

  const handlePseudoDeleteItem = async () => {
    if (confirmDeleteItem) {
      const updatedItem = { ...confirmDeleteItem, deletado: true };

      const index = lancamentos.indexOf(confirmDeleteItem);
      index > -1 && lancamentos.splice(index, 1);
      lancamentosDeletados.push(updatedItem);

      setLancamentos(lancamentos);
      setLancamentosDeletados(lancamentosDeletados);
      setDadosTabela({ object: lancamentos, isDeletados: false, garbageButtonLabel: 'Garbage bin 🗑️' });
      setConfirmUpdateItem(null);

      try {
        await handlePseudoDelete({
          route: 'financeiro/financas',
          item: confirmDeleteItem,
          deletar: true
        });
      } catch (error) {
        setLancamentos(lancamentos);
        setDadosTabela({ object: lancamentos, isDeletados: false,  })
        setConfirmUpdateItem(confirmUpdateItem);
        console.error("Delete failed:", error);
      }
    }
  };

  const generatePDF = () => {
    import('html2pdf.js').then((html2pdfModule) => {
      const html2pdf = html2pdfModule.default;

      const content = document.getElementById('report');

      const pdfOptions = {
        margin: 10,
        filename: `report.pdf`,
        image: { type: 'png', quality: 1 },
        html2canvas: { scale: 1 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
      };

      html2pdf().from(content).set(pdfOptions).save();
    });
  };


  const toggleLinhaVisivel = (id) => {
    setLinhasVisiveis(prevState => ({
      ...prevState,
      [id]: !prevState[id]
    }));
  };

  return (
    <div className="centered-container">
      {loading && <Loading />}
      <h2>Financial Releases Data</h2>
      <button onClick={generatePDF} className='botao-bonito' style={{ marginTop: '-10px', marginBottom: '30px' }}>Export Table</button>
      <div id="report">
        <table className={styles.tabela_financas}>
          <thead>
            <tr>
              <th>Type</th>
              <th>Description</th>
              <th>Value</th>
              <th>Date</th>
              <th>Area</th>
              <th>Origin</th>
              <th>Destiny</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <CadastroInputs
              obj={novoSubmit}
              objSetter={setNovoSubmit}
              funcao={enviar}
              tipo='cadastro' 
            />
            {dadosTabela.object.map((item, index) => (
              <React.Fragment key={item._id}>
                {index % 12 === 0 && index !== 0 && <div className="html2pdf__page-break" />}
                {!linhasVisiveis[item._id] ? (
                  <React.Fragment>
                    <tr>
                      <td>{labelsTipo[item.tipo]}</td>
                      <td style={{ color: item.tipo === 'Income' ? 'green' : item.tipo === 'Exchange' ? '#335EFF' : 'red' }}>
                        {item.descricao}
                      </td>
                      <td style={{ color: item.tipo === 'Income' ? 'green' : item.tipo === 'Exchange' ? '#335EFF' : 'red' }}>
                        <b>R${Math.abs(item.valor).toFixed(2)}</b>
                      </td>
                      <td>{item.data}</td>
                      <td>{item.area}</td>
                      <td>{item.origem}</td>
                      <td>{item.destino}</td>
                      {!dadosTabela.isDeletados ? (
                        <td className="botoes_acoes">
                          <button onClick={() => setConfirmDeleteItem(item)}>❌</button>
                          <button onClick={() => { toggleLinhaVisivel(item._id); handleUpdateClick(item) }}>⚙️</button>
                        </td>
                      ) : (
                        <td className="botoes_acoes">
                          <button onClick={() => setDeleteInfo({ success: null, item: item })}>❌</button>
                          <button onClick={() => setConfirmRestoreItem(item)}>🔄</button>
                        </td>
                      )}
                    </tr>
                  </React.Fragment>
                ) : (
                  <React.Fragment>
                    <CadastroInputs
                      obj={novosDados}
                      objSetter={setNovosDados} funcao={{
                        funcao1: () => handleUpdateItem(),
                        funcao2: () => toggleLinhaVisivel(item._id)
                      }}
                      tipo='update' />
                  </React.Fragment>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
        
        <button className="botao-padrao" style={{width: '130px'}} onClick={() => {dadosTabela.isDeletados ?
          setDadosTabela({ object: lancamentos, isDeletados: false, garbageButtonLabel: 'Garbage bin 🗑️' })
          :
          setDadosTabela({ object: lancamentosDeletados, isDeletados: true, garbageButtonLabel: 'Exit bin 🗑️' })}}>
            {dadosTabela.garbageButtonLabel}</button>
      </div>

      {confirmDeleteItem && (
        <Modal objeto={{
          titulo: `Are you sure you want to delete "${confirmDeleteItem.descricao}"?`,
          botao1: {
            funcao: () => { handlePseudoDeleteItem(); setConfirmDeleteItem(null) }, texto: 'Confirm'
          },
          botao2: {
            funcao: () => setConfirmDeleteItem(null), texto: 'Cancel'
          }
        }} />
      )}

      {deleteInfo.item && (
        <Modal objeto={{
          titulo: `Are you sure you want to PERMANENTLY delete "${deleteInfo.item.descricao}"?`,
          alerta: true,
          botao1: {
            funcao: handleConfirmDelete, texto: 'Confirm'
          },
          botao2: {
            funcao: () => setDeleteInfo({ success: null, item: null }), texto: 'Cancel'
          }
        }} />
      )}

      {confirmRestoreItem && (
        <Modal objeto={{
          titulo: `Do you want to restore "${confirmRestoreItem.descricao}"?`,
          botao1: {
            funcao: () => { handleRestoreItem(); setConfirmRestoreItem(null) }, texto: 'Confirm'
          },
          botao2: {
            funcao: () => setConfirmDeleteItem(null), texto: 'Cancel'
          }
        }} />
      )}

      {deleteInfo.success != null && (
        <Modal objeto={{
          titulo: deleteInfo.success ? 'Deletion successful!' : 'Deletion failed.',
          botao1: {
            funcao: () => setDeleteInfo({ success: null, item: null }), texto: 'Close'
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
    </div>
  );
};

export default Tabela;