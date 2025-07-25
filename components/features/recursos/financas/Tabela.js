import React, { useEffect, useState, useContext } from 'react';
import Loading from '../../../ui/Loading';
import Modal from '../../../ui/Modal';
import CadastroInputs from './CadastroInputs';
import styles from '../../../../styles/modules/financas.module.css'
import { handleSubmit, fetchData, handleDelete, handleUpdate, handlePseudoDelete } from '../../../../functions/crud';
import { jsDateToEuDate, euDateToIsoDate, cleanForm } from '../../../../functions/general';
import { AuthContext } from '../../../../contexts/AuthContext';

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
  const { isAdmin } = useContext(AuthContext);


  //funcao que busca os dados de lancamentos e cria as arrays lancamentos e lancamentosDeletados,
  //alem de calcular e organizar o balance
  const fetchLancamentos = async () => {
    try {
      const data = await fetchData('financas/financas/get/lancamentos');
      var balance = 0;
      data.lancamentos.forEach((item) => {
        item.data = jsDateToEuDate(item.data);
        if (item.tipo != "Exchange" && !item.deletado) balance = balance + item.valor;
        item.balance = balance.toFixed(2);
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

      let lancamentosReversed = [];
      for (let i = lancamentos.length; i > 0; i--) {
        lancamentosReversed.push(lancamentos[i - 1]);
      }
      lancamentosDeletados.forEach((lancamento) => {
        lancamento.balance = "-"
      })
      setLancamentos(lancamentosReversed);
      setDadosTabela({ object: lancamentosReversed, isDeletados: false, garbageButtonLabel: 'Garbage bin 🗑️' })
      setLancamentosDeletados(lancamentosDeletados);

    } finally {
      setLoading(false);
    }
  };

  //useEffect que so roda na primeira execucao
  useEffect(() => {
    fetchLancamentos();
  }, []);

  //funcao que envia o id para deletar os itens
  const handleConfirmDelete = async () => {
    if (deleteInfo.item) {
      var getDeleteSuccess = false;
      try {
        getDeleteSuccess = await handleDelete({
          route: 'financas/financas',
          item: deleteInfo.item,
          fetchDados: fetchLancamentos
        });
      } finally {
        setDeleteInfo({ success: getDeleteSuccess, item: null })
      }
    }
    setDeleteInfo({ success: getDeleteSuccess, item: null })
  };

  const modalLabels = {
    'inputsVazios': 'Fill out all fields before adding new data!',
    'valorNegativo': 'The value cannot be negative!',
  };


  //funcao que trata os dados dependendo do tipo e envia para o banco
  const enviar = async () => {
    const isExpense = novoSubmit.tipo === 'Expense';
    const valor = isExpense ? -parseFloat(novoSubmit.valor) : parseFloat(novoSubmit.valor);
    const updatedNovoSubmit = {
      ...novoSubmit,
      deletado: false,
      valor: valor
    };
    await handleSubmit({
      route: 'financas/financas',
      dados: updatedNovoSubmit,
      fetchDados: fetchLancamentos
    });
    cleanForm(novoSubmit, setNovoSubmit, camposVazios);
  };

  //funcao que trata o item e o insere em novosDados
  const handleUpdateClick = (item) => {
    let valorCorrigido = 0;
    if (Number(item.valor) < 0) {
      valorCorrigido = item.valor * -1;
    } else {
      valorCorrigido = item.valor;
    }

    setConfirmItemAction({ action: 'update', item: item })
    setNovosDados({
      _id: item._id,
      tipo: item.tipo,
      descricao: item.descricao,
      valor: valorCorrigido,
      data: euDateToIsoDate(item.data),
      area: item.area,
      origem: item.origem,
      destino: item.destino,
    });
  };

  //funcao que trata os dados e envia para update
  const handleUpdateItem = async () => {
    if (confirmItemAction.action === 'update' && confirmItemAction.item) {
      setLoading(true);
      const isExpense = confirmItemAction.item.tipo === 'Expense';
      const valorInverso = isExpense ? novosDados.valor * -1 : novosDados.valor;
      const updatedItem = { ...novosDados, valor: valorInverso };
      delete updatedItem.balance;
      setConfirmItemAction({ action: '', item: null })
      try {
        await handleUpdate({
          route: 'financas/financas/update?id',
          dados: updatedItem,
          fetchDados: fetchLancamentos
        });
      } catch (error) {
        setConfirmItemAction({ action: 'update', item: confirmItemAction.item })
        console.error("Update failed:", error);
      }
      setLoading(false);
      setLinhaVisivel();
      setNovosDados(camposVazios);
    }
  };

  //funcao para restaurar itens, ou atualizar apenas o estado deletado para false
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
      await handlePseudoDelete({
        route: 'financas/financas',
        item: confirmItemAction.item,
        deletar: false,
        fetchDados: fetchLancamentos
      });
    }
  }

  //funcao para pseudoDeletar itens, ou atualizar apenas o estado deletado para true
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
      try {
        await handlePseudoDelete({
          route: 'financas/financas',
          item: confirmItemAction.item,
          deletar: true,
          fetchDados: fetchLancamentos
        });
      } catch (error) {
        setLancamentos(lancamentos);
        setDadosTabela({ object: lancamentos, isDeletados: false, })
        setConfirmItemAction({ action: 'update', item: confirmItemAction.item })
        console.error("Delete failed:", error);
      }
    }
  };

  //funcao para limpar a lixeira
  const limparLixeira = async () => {
    await fetch(`/api/financas/cleanBin`, {
      credentials: 'include',
      method: 'DELETE',
    })
    await fetchLancamentos();
  }

  return (
    <div className="centered-container">
      {loading && <Loading />}
      <h2 className='smallTitle'>Financial Releases Data</h2>
      <div id="report" className={styles.tabela_financas_container}>
        <div className={styles.tabela_financas_wrapper}>
          <table className={`tabela ${styles.tabela_financas}`}>
            <thead>
              <tr>
                <th>Type</th>
                <th>Description</th>
                <th>Value</th>
                <th>Date</th>
                <th>Area</th>
                <th>Origin</th>
                <th>Destiny</th>
                <th>Balance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <CadastroInputs
                obj={novoSubmit}
                objSetter={setNovoSubmit}
                funcoes={{
                  enviar
                }}
                setExibirModal={setExibirModal}
                tipo='cadastro'
              />
              {dadosTabela.object.map((item, index) => (
                <React.Fragment key={item._id}>
                  {linhaVisivel === item._id ? (
                    <React.Fragment>
                      <CadastroInputs
                        obj={novosDados}
                        objSetter={setNovosDados}
                        funcoes={{
                          enviar: () => handleUpdateItem(),
                          cancelar: () => linhaVisivel === item._id ? setLinhaVisivel() : setLinhaVisivel(item._id)
                        }}
                        setExibirModal={setExibirModal}
                        tipo='update' />
                    </React.Fragment>
                  ) : (
                    <React.Fragment>
                      <tr key={index}>
                        <td>{labelsTipo[item.tipo]}</td>
                        <td className={styles.tdDescricao} style={{ color: item.tipo === 'Income' ? 'green' : item.tipo === 'Exchange' ? '#335EFF' : 'red' }}>
                          {item.descricao}
                        </td>
                        <td className={styles.tdValor} style={{ color: item.tipo === 'Income' ? 'green' : item.tipo === 'Exchange' ? '#335EFF' : 'red' }}>
                          <b>R${Math.abs(item.valor).toFixed(2)}</b>
                        </td>
                        <td className={styles.tdData}>{item.data}</td>
                        <td className={styles.tdArea}>{item.area}</td>
                        <td className={styles.tdOrigem}>{item.origem}</td>
                        <td className={styles.tdDestino}>{item.destino}</td>
                        <td className={styles.tdBalanco}>
                          <a style={{ color: item.tipo === 'Income' ? 'green' : 'red', fontSize: '1.2rem' }}>
                            {item.tipo === 'Income' ? "▲" : item.tipo === 'Exchange' ? "" : '▼'}
                          </a>
                          <b>R${item.balance}</b>
                        </td>
                        {!dadosTabela.isDeletados ? (
                          <td className="botoes_acoes">
                            <button onClick={() => setConfirmItemAction({ action: 'delete', item: item })}
                              disabled={!isAdmin}>❌</button>
                            <button onClick={() => {
                              linhaVisivel === item._id ? setLinhaVisivel() : setLinhaVisivel(item._id); handleUpdateClick(item)
                            }}
                              disabled={!isAdmin}>⚙️</button>
                          </td>
                        ) : (
                          <td className="botoes_acoes">
                            <button onClick={() => setDeleteInfo({ success: null, item: item })}
                              disabled={!isAdmin}>❌</button>
                            <button onClick={() => setConfirmItemAction({ action: 'restore', item: item })}
                              disabled={!isAdmin}>🔄</button>
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
          <button className="botao-padrao" style={{ width: '130px' }} disabled={!isAdmin} onClick={() => setLimparLixo(true)}>Clean bin ♻️</button>
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