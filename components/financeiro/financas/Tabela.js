import React, { useEffect, useState } from 'react';
import Loading from '../../Loading';
import styles from '../../../styles/modules/radio.module.css';
import { fetchData, handleDelete, handleUpdate } from '../../../functions/crud';
import { stringToDate, stringToIsoDate } from '../../../functions/general';

const labelsTipo = {
  Income: 'Income',
  Expense: 'Cost',
  Exchange: 'Exchange'
};


const Tabela = () => {
  const [lancamentos, setLancamentos] = useState([]);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
  const [confirmUpdateItem, setConfirmUpdateItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [novosDados, setNovosDados] = useState({
    tipo: '',
    descricao: '',
    valor: '',
    data: '',
    area: '',
    origem: '',
    destino: ''
  });

  const handleChange = (e) => {
    setNovosDados({
      ...novosDados,
      [e.target.name]: e.target.value,
    });
  };

  const fetchLancamentos = async () => {
    try {
      const data = await fetchData('financeiro/financas/get/lancamentos');
      data.lancamentos.forEach((item) => {
        item.data = stringToDate(item.data);
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
    if (confirmDeleteItem) {
      var getDeleteSuccess = false;
      try {
        getDeleteSuccess = handleDelete({
          route: 'financeiro/financas', 
          item: confirmDeleteItem, 
          fetchDados: fetchLancamentos});
      } finally {
        setDeleteSuccess(getDeleteSuccess);
      }
    }
    setConfirmDeleteItem(null);
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
      data: stringToIsoDate(item.data),
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
        item._id === updatedItem._id ? { ...updatedItem, data: stringToDate(updatedItem.data) } : item
      );
      setLancamentos(updatedLancamentos);
      setConfirmUpdateItem(null);
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

      // Opções de configuração do PDF
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

  return (
    <div className="centered-container">
      {loading && <Loading />}
      <h2>Financial Releases Data</h2>
      <button onClick={generatePDF} className="botao-cadastro" style={{ marginTop: '-10px', marginBottom: '30px' }}>Export Table</button>
      <div id="report">
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Description</th>
              <th>Value</th>
              <th>Date</th>
              <th>Area</th>
              <th style={{ width: '10%' }}>Origin</th>
              <th style={{ width: '10%' }}>Destiny</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {lancamentos.map((item, index) => (
              <React.Fragment key={item._id}>
                {index % 12 === 0 && index !== 0 && <div className="html2pdf__page-break" />}
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
                    <div className="botoes-acoes">
                      <button onClick={() => setConfirmDeleteItem(item)}>❌</button>
                      <button onClick={() => handleUpdateClick(item)}>⚙️</button>
                    </div>
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {confirmDeleteItem && (
        <div className="overlay">
          <div className="modal">
            <p>Are you sure you want to delete "{confirmDeleteItem.descricao}"?</p>
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

      {confirmUpdateItem && (
        <div className="overlay">
          <div className="modal">
            <div className={styles.containerPai}>
              <label className={styles.container}>
                <input
                  type="radio"
                  name="tipo"
                  value="Income"
                  checked={novosDados.tipo === 'Income'}
                  onChange={handleChange}
                  required
                />
                <span className={styles.checkmark}></span>
                Income
              </label>
              <label className={styles.container}>
                <input
                  type="radio"
                  name="tipo"
                  value="Expense"
                  checked={novosDados.tipo === 'Expense'}
                  onChange={handleChange}
                  required
                />
                <span className={styles.checkmark}></span>
                Expense
              </label>
              <label className={styles.container}>
                <input
                  type="radio"
                  name="tipo"
                  value="Exchange"
                  checked={novosDados.tipo === 'Exchange'}
                  onChange={handleChange}
                  required
                />
                <span className={styles.checkmark}></span>
                Exchange
              </label>
            </div>
            <div className="centered-container">
              <label htmlFor="descricao">Description</label>
              <input
                type="text"
                id="descricao"
                name="descricao"
                placeholder=""
                onChange={handleChange}
                value={novosDados.descricao}
                required
              />
              <label htmlFor="valor">Value</label>
              <input
                type="number"
                name="valor"
                onChange={handleChange}
                value={novosDados.valor}
                required
              />
              <label htmlFor="data">Date</label>
              <input
                type="date"
                name="data"
                onChange={handleChange}
                value={novosDados.data}
                required
              />
              <label htmlFor="area">Area</label>
              <select
                name="area"
                onChange={handleChange}
                value={novosDados.area}
                required
              >
                <option value="" disabled>Select an area</option>
                <option value="3D printing">3D printing</option>
                <option value="Engineering">Engineering</option>
                <option value="Extras">Extras</option>
                <option value="Marketing">Marketing</option>
                <option value="Machining">Machining</option>
                <option value="Painting">Painting</option>
                <option value="Pit Display">Pit Display</option>
                <option value="Portfolios">Portfolios</option>
                <option value="Sponsorship">Sponsorship</option>
                <option value="Traveling">Traveling</option>
              </select>
              <label htmlFor="origem">Credited Account (Origin)</label>
              <input
                type="text"
                name="origem"
                placeholder=""
                onChange={handleChange}
                value={novosDados.origem}
                required
              />
              <label htmlFor="destino">Debited Account (Destiny)</label>
              <input
                type="text"
                name="destino"
                placeholder=""
                onChange={handleChange}
                value={novosDados.destino}
                required
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="botao-cadastro" onClick={handleUpdateItem}>Update</button>
              <button className="botao-cadastro" onClick={() => setConfirmUpdateItem(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tabela;
