import React, { useEffect, useState } from 'react';
import Loading from '../../Loading';
import Modal from '../../Modal';
import CadastroInputs from './CadastroInputs';
import { handleSubmit, fetchData, handleDelete, handleUpdate } from '../../../functions/crud';
import { jsDateToEuDate, euDateToIsoDate, cleanForm } from '../../../functions/general';

const labelsTipo = {
  Income: 'Income',
  Expense: 'Cost',
  Exchange: 'Exchange'
};

const Tabela = () => {
  const [lancamentos, setLancamentos] = useState([]);
  const [deleteInfo, setDeleteInfo] = useState({ success: null, item: null });
  const [confirmUpdateItem, setConfirmUpdateItem] = useState(null);
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
      setLancamentos(data.lancamentos);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLancamentos();
  }, []);

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
        <table>
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
              tipo='cadastro' />
            {lancamentos.map((item, index) => (
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
                      <td>
                        <button onClick={() => setDeleteInfo({ success: null, item: item })}>❌</button>
                        <button onClick={() => { toggleLinhaVisivel(item._id); handleUpdateClick(item) }}>⚙️</button>
                      </td>
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
      </div>

      {deleteInfo.item && (
        <Modal objeto={{
          titulo: `Are you sure you want to delete "${deleteInfo.item.descricao}"?`,
          botao1: {
            funcao: handleConfirmDelete, texto: 'Confirm'
          },
          botao2: {
            funcao: () => setDeleteInfo({ success: null, item: null }), texto: 'Cancel'
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