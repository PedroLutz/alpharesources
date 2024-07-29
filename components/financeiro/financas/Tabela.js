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
  const [confirmItemAction, setConfirmItemAction] = useState({ action: '', item: null });
  const [limparLixo, setLimparLixo] = useState(false);
  const [exibirModal, setExibirModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [linhaVisivel, setLinhaVisivel] = useState({});
  const [reload, setReload] = useState(false);
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
    setReload(false);
    fetchLancamentos();
  }, [reload]);

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

  const checkDados = (tipo) => {
    setExibirModal(tipo); return;
  };

  const modalLabels = {
    'inputsVazios': 'Fill out all fields before adding new data!',
    'valorNegativo': 'The value cannot be negative!',
  };

  const enviar = async (e) => {
    e.preventDefault();
    const isExpense = novoSubmit.tipo === 'Expense';
    const valor = isExpense ? -parseFloat(novoSubmit.valor) : parseFloat(novoSubmit.valor);
    const updatedNovoSubmit = {
      ...novoSubmit,
      deletado: false,
      valor: valor
    };
    handleSubmit({
      route: 'financeiro/financas',
      dados: updatedNovoSubmit
    });
    cleanForm(novoSubmit, setNovoSubmit);
    setReload(true);
  };

  const handleUpdateClick = (item) => {
    let valorCorrigido = 0;
    if (Number(item.valor) < 0) {
      valorCorrigido = item.valor * -1;
    } else {
      valorCorrigido = item.valor;
    }

    setConfirmItemAction({ action: 'update', item: item })
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
    if (confirmItemAction.action === 'update' && confirmItemAction.item) {
      const isExpense = confirmItemAction.item.tipo === 'Expense';
      const valorInverso = isExpense ? novosDados.valor * -1 : novosDados.valor;
      const updatedItem = { ...confirmItemAction.item, ...novosDados, valor: valorInverso };

      const updatedLancamentos = lancamentos.map(item =>
        item._id === updatedItem._id ? { ...updatedItem, data: jsDateToEuDate(updatedItem.data) } : item
      );
      setLancamentos(updatedLancamentos);
      setDadosTabela({ object: updatedLancamentos, isDeletados: false, garbageButtonLabel: 'Garbage bin 🗑️' });
      setConfirmItemAction({ action: '', item: null })
      linhaVisivel === confirmItemAction.item._id ? setLinhaVisivel() : setLinhaVisivel(confirmItemAction.item._id);
      setReload(true);
      try {
        await handleUpdate({
          route: 'financeiro/financas/update?id',
          dados: updatedItem,
          item: confirmItemAction.item
        });
      } catch (error) {
        setLancamentos(lancamentos);
        setConfirmItemAction({ action: 'update', item: confirmItemAction.item })
        console.error("Update failed:", error);
      }
    }
  };

  const handleRestoreItem = async () => {
    if (confirmItemAction.action === 'restore' || confirmItemAction.item) {
      const updatedItem = { ...confirmItemAction.item, deletado: false };

      const index = lancamentosDeletados.indexOf(confirmItemAction.item);
      index > -1 && lancamentosDeletados.splice(index, 1);
      lancamentos.push(updatedItem);

      setLancamentos(lancamentos);
      setLancamentosDeletados(lancamentosDeletados);
      setDadosTabela({ object: lancamentos, isDeletados: false, garbageButtonLabel: 'Garbage bin 🗑️' });
      setConfirmItemAction({ action: '', item: null });
      setReload(true);
      await handlePseudoDelete({
        route: 'financeiro/financas',
        item: confirmItemAction.item,
        deletar: false
      });
    }
  }

  const handlePseudoDeleteItem = async () => {
    if (confirmItemAction.action === 'delete' || confirmItemAction.item) {
      const updatedItem = { ...confirmItemAction.item, deletado: true };

      const index = lancamentos.indexOf(confirmItemAction.item);
      index > -1 && lancamentos.splice(index, 1);
      lancamentosDeletados.push(updatedItem);

      setLancamentos(lancamentos);
      setLancamentosDeletados(lancamentosDeletados);
      setDadosTabela({ object: lancamentos, isDeletados: false, garbageButtonLabel: 'Garbage bin 🗑️' });
      setConfirmItemAction({ action: '', item: null })
      setReload(true);
      try {
        await handlePseudoDelete({
          route: 'financeiro/financas',
          item: confirmItemAction.item,
          deletar: true
        });
      } catch (error) {
        setLancamentos(lancamentos);
        setDadosTabela({ object: lancamentos, isDeletados: false, })
        setConfirmItemAction({ action: 'update', item: confirmItemAction.item })
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

  const limparLixeira = async () => {
    await fetch(`/api/financeiro/financas/delete/cleanBin`, {
      method: 'DELETE',
    })
    setReload(true);
  }

  return (
    <div className="centered-container">
      {loading && <Loading />}
      <h2>Financial Releases Data</h2>
      <button onClick={generatePDF} className='botao-bonito margem'>Export Table</button>
      <div id="report" className={styles.tabela_financas_container}>
        <div className={styles.tabela_financas_wrapper}>
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
                checkDados={checkDados}
                tipo='cadastro'
              />
              {dadosTabela.object.map((item, index) => (
                <React.Fragment key={item._id}>
                  {index % 12 === 0 && index !== 0 && <div className="html2pdf__page-break" />}
                  {linhaVisivel === item._id ? (
                    <React.Fragment>
                      <CadastroInputs
                        obj={novosDados}
                        objSetter={setNovosDados}
                        funcao={{
                          funcao1: () => handleUpdateItem(),
                          funcao2: () => linhaVisivel === item._id ? setLinhaVisivel() : setLinhaVisivel(item._id)
                        }}
                        checkDados={checkDados}
                        tipo='update' />
                    </React.Fragment>
                  ) : (
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
                            <button onClick={() => setConfirmItemAction({ action: 'delete', item: item })}>❌</button>
                            <button onClick={() => {
                              linhaVisivel === item._id ? setLinhaVisivel() : setLinhaVisivel(item._id); handleUpdateClick(item)
                            }}>⚙️</button>
                          </td>
                        ) : (
                          <td className="botoes_acoes">
                            <button onClick={() => setDeleteInfo({ success: null, item: item })}>❌</button>
                            <button onClick={() => setConfirmItemAction({ action: 'restore', item: item })}>🔄</button>
                          </td>
                        )}
                      </tr>
                    </React.Fragment>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div>
      <button className="botao-padrao" style={{ width: '130px' }} onClick={() => {
        dadosTabela.isDeletados ?
          setDadosTabela({ object: lancamentos, isDeletados: false, garbageButtonLabel: 'Garbage bin 🗑️' })
          :
          setDadosTabela({ object: lancamentosDeletados, isDeletados: true, garbageButtonLabel: 'Exit bin 🗑️' })
      }}>
        {dadosTabela.garbageButtonLabel}</button>
        {dadosTabela.isDeletados && (
          <button className="botao-padrao" style={{ width: '130px' }} onClick={() => setLimparLixo(true)}>Clean bin ♻️</button>
        )}
      </div>
      

      {confirmItemAction.action === 'delete' && confirmItemAction.item && (
        <Modal objeto={{
          titulo: `Are you sure you want to delete "${confirmItemAction.item.descricao}"?`,
          botao1: {
            funcao: () => { handlePseudoDeleteItem(); setConfirmItemAction({ action: '', item: null }) }, texto: 'Confirm'
          },
          botao2: {
            funcao: () => setConfirmItemAction({ action: '', item: null }), texto: 'Cancel'
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

      {confirmItemAction.action === 'restore' && confirmItemAction.item && (
        <Modal objeto={{
          titulo: `Do you want to restore "${confirmItemAction.item.descricao}"?`,
          botao1: {
            funcao: () => { handleRestoreItem(); setConfirmItemAction({ action: '', item: null }) }, texto: 'Confirm'
          },
          botao2: {
            funcao: () => setConfirmItemAction({ action: '', item: null }), texto: 'Cancel'
          }
        }} />
      )}

      {limparLixo && (
        <Modal objeto={{
          titulo: `Are you sure you want to PERMANENTLY delete all itens in the garbage bin?`,
          alerta: true,
          botao1: {
            funcao: () => { limparLixeira(); setLimparLixo(false) }, texto: 'Confirm'
          },
          botao2: {
            funcao: () => setLimparLixo(false), texto: 'Cancel'
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

      {exibirModal != null && (
        <Modal objeto={{
          titulo: modalLabels[exibirModal],
          botao1: {
            funcao: () => setExibirModal(null), texto: 'Okay'
          },
        }} />
      )}
    </div>
  );
};

export default Tabela;