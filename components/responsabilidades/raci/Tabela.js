import React, { useEffect, useState, useContext } from 'react';
import members from '../../../styles/modules/members.module.css';
import Loading from '../../Loading';
import Modal from '../../Modal';
import CadastroInputs from './CadastroInputs';
import { fetchData, handleDelete, handleUpdate, handleSubmit } from '../../../functions/crud';
import { cleanForm } from '../../../functions/general';
import { AuthContext } from '../../../contexts/AuthContext';

const Tabela = () => {
  const [itensRaci, setItensRaci] = useState([]);
  const [nomesMembros, setNomesMembros] = useState([]);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
  const [confirmUpdateItem, setConfirmUpdateItem] = useState(null);
  const [verOpcoes, setVerOpcoes] = useState(false);
  const [loading, setLoading] = useState(true);
  const [exibirModal, setExibirModal] = useState(null);
  const [linhaVisivel, setLinhaVisivel] = useState({});
  const [reload, setReload] = useState(false);
  const [cores, setCores] = useState({});
  const camposVazios = {
    area: "",
    item: "",
    responsabilidades: ""
  }
  const [novoSubmit, setNovoSubmit] = useState(camposVazios);
  const [novosDados, setNovosDados] = useState(camposVazios);
  const {isAdmin} = useContext(AuthContext);

  const handleUpdateClick = (item) => {
    setConfirmUpdateItem(item);
    const responsabilidadesArray = item.responsabilidades.split(", ");
    setNovosDados({
      area: item.area,
      item: item.item
    });

    inputNames.forEach((membro, index) => {
      const responsabilidade = responsabilidadesArray[index % responsabilidadesArray.length];
      setNovosDados(prevFormData => ({
        ...prevFormData,
        [`input${getCleanName(membro)}`]: responsabilidade
      }));
    });
  };

  const fetchCores = async () => {
    const data = await fetchData('wbs/get/cores');
    var cores = {};
    data.areasECores.forEach((area) => {
      cores = { ...cores, [area._id]: area.cor[0] ? area.cor[0] : '' }
    })
    setCores(cores);
  }

  const fetchItensRaci = async () => {
    const data = await fetchData('responsabilidades/raci/get');
    setItensRaci(data.itensRaci);
  };

  const enviar = async (e) => {
    e.preventDefault();
    var itemJaUsado = false;
    itensRaci.forEach((item) => {
      if (Object.values(item).indexOf(novoSubmit.area) > -1) {
        if (Object.values(item).indexOf(novoSubmit.item) > -1) {
          itemJaUsado = true;
        }
      }
    })
    if (itemJaUsado) {
      setExibirModal('itemJaUsado')
      return;
    }
    const updatedFormData = {
      ...novoSubmit,
      responsabilidades: inputNames.map(inputName => novoSubmit["input" + getCleanName(inputName)]).join(', ')
    };

    handleSubmit({
      route: 'responsabilidades/raci',
      dados: updatedFormData,
    });
    cleanForm(novoSubmit, setNovoSubmit, camposVazios);
    await fetchItensRaci();
    setReload(true);
  };

  const fetchNomesMembros = async () => {
    const data = await fetchData('responsabilidades/membros/get/nomes');
    setNomesMembros(data.nomes);
  };

  const generateInputNames = () => {
    const firstNames = new Map();
    const fullNames = [];
    const inputNames = [];

    nomesMembros.forEach((membro) => {
      const nomeCompleto = membro.nome;
      const firstName = nomeCompleto.split(' ')[0];
      const lastName = nomeCompleto.split(' ')[1];
      const corrigirNomeCompleto = () => {
        let index = fullNames.findIndex(x => x.includes(firstName));
        let otherLastName = fullNames[index].split(' ')[1];
        inputNames[index] = `${firstName} ${otherLastName}`;
      };

      if (firstNames.has(firstName)) {
        const existingHeader = firstNames.get(firstName);
        inputNames.push(`${existingHeader} ${lastName}`);
        fullNames.push(`${firstName} ${lastName}`);
        corrigirNomeCompleto();
      } else {
        firstNames.set(firstName, nomeCompleto.split(' ')[0]);
        inputNames.push(firstName);
        fullNames.push(`${firstName} ${lastName}`);
      };
    });
    return inputNames;
  };
  const inputNames = generateInputNames();

  const generateFormData = () => {
    inputNames.forEach((membro) => {
      setNovoSubmit(({
        ...novoSubmit,
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
    setReload(false);
    try {
      fetchNomesMembros();
      fetchItensRaci();
      fetchCores();
    } finally {
      setLoading(false);
    }
    generateFormData();
  }, [reload]);

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
        lastName != undefined ? fullNames.push(`${firstName} ${lastName}`) : fullNames.push(`${firstName}`);
      };
    });
    return [headers, fullNames];
  };
  const tableHeaders = generateTableHeaders()[0];
  const tableNames = generateTableHeaders()[1];

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

  const checkDados = (tipo) => {
    setExibirModal(tipo); return;
  };

  const modalLabels = {
    'inputsVazios': 'Fill out all fields before adding new data!',
    'valorNegativo': 'The value cannot be negative!',
    'itemJaUsado': 'This item has already been registered!'
  };

  const handleUpdateItem = async () => {
    if (confirmUpdateItem) {
      setLoading(true);
      const responsabilidadesString = Object.keys(novosDados)
        .filter(key => key.startsWith('input'))
        .map(key => novosDados[key]).join(', ');
      const { area, item } = novosDados;
      const updatedItem = { _id: confirmUpdateItem._id, area, item, responsabilidades: responsabilidadesString };
      const updatedItensRaci = itensRaci.map(item =>
        item._id === updatedItem._id ? { ...updatedItem } : item
      );

      setItensRaci(updatedItensRaci);
      setConfirmUpdateItem(null);
      try {
        await handleUpdate({
          route: 'responsabilidades/raci/update?id',
          dados: updatedItem,
          item: confirmUpdateItem
        });
      } catch (error) {
        setItensRaci(itensRaci);
        setConfirmUpdateItem(confirmUpdateItem);
        console.error("Update failed:", error);
      }
      setLoading(false);
    }
    setLinhaVisivel();
    setConfirmUpdateItem(null);
    generateFormData();
  };

  return (
    <div className="centered-container">
      {loading && <Loading />}
      <h2>RACI Matrix</h2>
      <button className="botao-bonito" style={{ width: '9rem' }} onClick={() => setVerOpcoes(!verOpcoes)}>Toggle options</button>
      <div className={members.tabelaRaci_container}>
        <div className={members.tabelaRaci_wrapper}>
          <table className={members.tabelaRaci}>
            <thead>
              <tr>
                <th>Area</th>
                <th>Item</th>
                {!verOpcoes ? (
                  <React.Fragment>
                    {tableHeaders.map((membro, index) => (
                      <th key={index} className='notLast'>{membro}</th>
                    ))}

                  </React.Fragment>
                ) : (
                  <React.Fragment>
                    {tableNames.map((membro, index) => (
                      <th key={index}>{membro}</th>
                    ))}
                    <th style={{ width: '5rem' }}>Actions</th>
                  </React.Fragment>
                )}

              </tr>
            </thead>
            <tbody>
              {verOpcoes && (
                <tr className="linha-cadastro">
                  <CadastroInputs
                    obj={novoSubmit}
                    objSetter={setNovoSubmit}
                    funcao={enviar}
                    checkDados={checkDados}
                    tipo='cadastro' />
                </tr>
              )}
              {itensRaci.map((item, index) => (
                <tr key={index} style={{backgroundColor: cores[item.area]}}>
                  {index === 0 || itensRaci[index - 1].area !== item.area ? (
                    <td rowSpan={calculateRowSpan(itensRaci, item.area, index)}
                      className={members.areaTc}>{item.area}</td>
                  ) : null}
                  <td className={members.itemTc}>{item.item}</td>
                  {linhaVisivel === item._id ? (
                    <React.Fragment>
                      <CadastroInputs
                        obj={novosDados}
                        objSetter={setNovosDados}
                        funcao={{
                          funcao1: () => handleUpdateItem(),
                          funcao2: () => linhaVisivel === item._id ? setLinhaVisivel(null) : setLinhaVisivel(item._id)
                        }}
                        tipo='update' />
                    </React.Fragment>
                  ) : (
                    <React.Fragment>
                      {tableHeaders.map((membro, index) => (
                        <td key={index} className='notLast'>{item.responsabilidades.split(', ')[tableHeaders.indexOf(membro)] || '-'}</td>
                      ))}
                      {verOpcoes && (
                        <td>
                          <div className="botoes_acoes lastMaior">
                            <button type="button" 
                            onClick={() => setConfirmDeleteItem(item)}
                            disabled={!isAdmin}>❌</button>
                            <button onClick={() => {
                              linhaVisivel === item._id ? setLinhaVisivel() : setLinhaVisivel(item._id); handleUpdateClick(item)
                            }} disabled={!isAdmin}>⚙️</button>
                          </div>
                        </td>
                      )}

                    </React.Fragment>
                  )
                  }
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {confirmDeleteItem && (
        <Modal objeto={{
          titulo: `Are you sure you want to delete "${confirmDeleteItem.area} - ${confirmDeleteItem.item}"?`,
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
  );
};

export default Tabela;