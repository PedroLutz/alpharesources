import React, { useEffect, useState } from 'react';
import members from '../../../styles/modules/members.module.css';
import Loading from '../../Loading';
import Modal from '../../Modal';
import { fetchData, handleDelete, handleUpdate } from '../../../functions/crud';

const Tabela = () => {
  const [itensRaci, setItensRaci] = useState([]);
  const [nomesMembros, setNomesMembros] = useState([]);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
  const [confirmUpdateItem, setConfirmUpdateItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    area: "",
    item: "",
    responsabilidades: ""
  });

  const handleChange = (e) => {
    setFormData(({
      ...formData,
      [e.target.name]: e.target.value,
    }));
  };

  const handleUpdateClick = (item) => {
    setConfirmUpdateItem(item);
    const responsabilidadesArray = item.responsabilidades.split(", ");
    setFormData({
      area: item.area,
      item: item.item
    });

    inputNames.forEach((membro, index) => {
      const responsabilidade = responsabilidadesArray[index % responsabilidadesArray.length];
      setFormData(prevFormData => ({
        ...prevFormData,
        [`input${getCleanName(membro)}`]: responsabilidade
      }));
    });
  };

  const fetchItensRaci = async () => {
    const data = await fetchData('responsabilidades/raci/get');
    setItensRaci(data.itensRaci);
  };

  const fetchNomesMembros = async () => {
    const data = await fetchData('responsabilidades/membros/get');
    setNomesMembros(data.nomes);
  };

  const generateInputNames = () => {
    const firstNames = new Map();
    const inputNames = [];

    nomesMembros.forEach((membro) => {
      const nomeCompleto = membro.nome;
      const firstName = nomeCompleto.split(' ')[0];
      const lastName = nomeCompleto.split(' ')[1];

      if (firstNames.has(firstName)) {
        const existingHeader = firstNames.get(firstName);
        inputNames.push(`${existingHeader} ${lastName}`);
      } else {
        firstNames.set(firstName, nomeCompleto.split(' ')[0]);
        inputNames.push(nomeCompleto.split(' ')[0]);
      }
    });
    return inputNames;
  };
  const inputNames = generateInputNames();

  const generateFormData = () => {
    inputNames.forEach((membro) => {
      setFormData(({
        ...formData,
        [`input${getCleanName(membro)}`]: ''
      }));
    });
  };

  const getCleanName = (str) => {
    const removeAccents = (str) => {
      return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    };
    return removeAccents(str.split(" ").join(""));
  };

  useEffect(() => {
    try {
      fetchNomesMembros();
      fetchItensRaci();
    } finally {
      setLoading(false);
    }
    generateFormData();
  }, []);

  const handleConfirmDelete = () => {
    if (confirmDeleteItem) {
      var getDeleteSuccess = false;
      try {
        getDeleteSuccess = handleDelete({
          route: 'responsabilidades/raci',
          item: confirmDeleteItem,
          fetchDados: fetchItensRaci
        });
      } finally {
        setDeleteSuccess(getDeleteSuccess);
      }
    }
    setConfirmDeleteItem(null);
  };

  const generateTableHeaders = () => {
    const firstNames = new Map();
    const fullNames = [];
    const headers = [];

    nomesMembros.forEach((membro) => {
      const nomeCompleto = membro.nome;
      const firstName = nomeCompleto.split(' ')[0];
      const lastName = nomeCompleto.split(' ')[1];
      const corrigirNomeCompleto = () => {
        let index = fullNames.findIndex(x => x.includes(firstName));
        let otherLastName = fullNames[index].split(' ')[1];
        headers[index] = `${firstName.charAt(0)}${otherLastName.charAt(0)}`;
      };

      if (firstNames.has(firstName)) {
        const existingHeader = firstNames.get(firstName);
        headers.push(existingHeader.charAt(0) + lastName.charAt(0));
        fullNames.push(`${firstName} ${lastName}`);
        corrigirNomeCompleto();
      } else {
        firstNames.set(firstName, nomeCompleto.split(' ')[0]);
        headers.push(firstName.charAt(0));
        fullNames.push(`${firstName} ${lastName}`);
      };
    });
    return headers;
  };
  const tableHeaders = generateTableHeaders();

  const calculateRowSpan = (itensRaci, currentArea, currentIndex) => {
    let rowSpan = 1;
    for (let i = currentIndex + 1; i < itensRaci.length; i++) {
      if (itensRaci[i].area === currentArea) {
        rowSpan++;
      } else {
        break;
      }
    }
    return rowSpan;
  };

  const handleUpdateItem = async (e) => {
    e.preventDefault();

    if (confirmUpdateItem) {
      const responsabilidadesString = Object.keys(formData)
        .filter(key => key.startsWith('input'))
        .map(key => formData[key]).join(', ');

      const { area, item } = formData;
      const updatedItem = { _id: confirmUpdateItem._id, area, item, responsabilidades: responsabilidadesString };
      const updatedItensRaci = itensRaci.map(item =>
        item._id === updatedItem._id ? { ...updatedItem } : item
      );

      setItensRaci(updatedItensRaci);
      setConfirmUpdateItem(null);
      try {
        await handleUpdate({
          route: 'responsabilidades/raci',
          dados: updatedItem,
          item: confirmUpdateItem
        });
      } catch (error) {
        setItensRaci(itensRaci);
        setConfirmUpdateItem(confirmUpdateItem);
        console.error("Update failed:", error);
      }
    }
    setConfirmUpdateItem(null);
    generateFormData();
  };

  return (
    <div className="centered-container">
      {loading && <Loading />}
      <h2>RACI Matrix</h2>
      <div id="report">
        <table className={members.tabelaRaci}>
          <thead>
            <tr>
              <th>Area</th>
              <th>Item</th>
              {tableHeaders.map((membro, index) => (
                <th key={index}>{membro}</th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {itensRaci.map((item, index) => (
              <tr key={index}>
                {index === 0 || itensRaci[index - 1].area !== item.area ? (
                  <td rowSpan={calculateRowSpan(itensRaci, item.area, index)}
                    className={members.areaTc}>{item.area}</td>
                ) : null}
                <td className={members.itemTc}>{item.item}</td>
                {tableHeaders.map((membro, index) => (
                  <td key={index}>{item.responsabilidades.split(', ')[tableHeaders.indexOf(membro)] || '-'}</td>
                ))}
                <td>
                  <div className="botoes-acoes">
                    <button type="button" onClick={() => setConfirmDeleteItem(item)}>❌</button>
                    <button type="button" onClick={() => handleUpdateClick(item)}>⚙️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>


      {confirmDeleteItem && (
        <Modal objeto={{
          titulo: `Are you sure you want to delete "${confirmDeleteItem.area} - ${confirmDeleteItem.item}"?`,
          botao1: {
            funcao: handleConfirmDelete, texto: 'Confirm'
          },
          botao2: {
            funcao: () => setConfirmDeleteItem(null), texto: 'Cancel'
          }
        }}/>
      )}

      {deleteSuccess && (
        <Modal objeto={{
          titulo: deleteSuccess ? 'Deletion successful!' : 'Deletion failed.',
          botao1: {
            funcao: () => setDeleteSuccess(false), texto: 'Close'
          },
        }}/>
      )}

      {confirmUpdateItem && (
        <div className="overlay">
          <div className="modal">
            <form onSubmit={handleUpdateItem}>
              <div>
                <div className="centered-container">
                  <div style={{ marginBottom: '20px' }}><b>{formData.area} -<br />{formData.item}</b></div>
                  {inputNames.map((membro, index) => (
                    <div className="mini-input" key={index}>
                      <label htmlFor={"input" + getCleanName(membro)}>{membro}</label>
                      <select
                        type="text"
                        id={"input" + getCleanName(membro)}
                        name={"input" + getCleanName(membro)}
                        placeholder=""
                        onChange={handleChange}
                        value={formData["input" + getCleanName(membro)]}
                        required
                      >
                        <option value="" disabled>Select responsibility</option>
                        <option value="R">Responsible</option>
                        <option value="A">Accountable</option>
                        <option value="C">Consulted</option>
                        <option value="I">Informed</option>
                      </select>
                    </div>

                  ))}
                </div>
              </div>
              <div>
                <button className="botao-cadastro" style={{ width: "55%" }} type="submit">Register RACI item</button>
                <button className="botao-cadastro" onClick={() => setConfirmUpdateItem(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tabela;