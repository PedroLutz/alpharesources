import React, { useEffect, useState, useContext, useMemo } from 'react';
import styles from '../../../../styles/modules/responsabilidades.module.css'
import Loading from '../../../ui/Loading';
import Modal from '../../../ui/Modal';
import CadastroInputs from './CadastroInputs';
import { fetchData, handleDelete, handleUpdate, handleSubmit } from '../../../../functions/crud';
import { cleanForm } from '../../../../functions/general';
import { AuthContext } from '../../../../contexts/AuthContext';

const Tabela = () => {
  const [itensRaci, setItensRaci] = useState([]);
  const [nomesMembros, setNomesMembros] = useState([]);
  const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
  const [verOpcoes, setVerOpcoes] = useState(false);
  const [loading, setLoading] = useState(true);
  const [exibirModal, setExibirModal] = useState(null);
  const [linhaVisivel, setLinhaVisivel] = useState({});
  const [reload, setReload] = useState(false);
  const [cores, setCores] = useState({});
  const camposVazios = {
    area: "",
    item: "",
  }
  const [novoSubmit, setNovoSubmit] = useState(camposVazios);
  const [novosDados, setNovosDados] = useState(camposVazios);
  const { isAdmin } = useContext(AuthContext);

  const handleUpdateClick = (item) => {
    const responsabilidadesArray = item.responsabilidades.split(", ");
    var objTemp = {
      _id: item._id,
      area: item.area,
      item: item.item
    };
    inputNames.forEach((membro, index) => {
      const responsabilidade = responsabilidadesArray[index % responsabilidadesArray.length];
      objTemp = {
        ...objTemp,
        [`input${getCleanName(membro)}`]: responsabilidade
      }
    });
    setNovosDados(objTemp);
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

  const enviar = async () => {
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

    if (!updatedFormData.responsabilidades.includes("A")) {
      setExibirModal('semAprovador');
      return;
    }
    if (!updatedFormData.responsabilidades.includes("R")) {
      setExibirModal('semResponsavel');
      return;
    }
    if ((updatedFormData.responsabilidades.match(/A/g) || []).length > 1) {
      setExibirModal('muitoAprovador');
      return;
    }
    await handleSubmit({
      route: 'responsabilidades/raci',
      dados: updatedFormData,
      fetchDados: fetchItensRaci
    });
    cleanForm(novoSubmit, setNovoSubmit, camposVazios);
    inputNames.forEach((inputName) => {
      setNovoSubmit((prevState) => ({
        ...prevState,
        ['input' + getCleanName(inputName)]: ''
      }));
    });
  };

  const fetchNomesMembros = async () => {
    const data = await fetchData('responsabilidades/membros/get/nomes');
    setNomesMembros(data.nomes);
  };

  const inputNames = useMemo(() => {
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
  }, [nomesMembros]);

  const generateFormData = () => {
    var objTemp = novoSubmit;
    inputNames.forEach((membro) => {
      objTemp = {
        ...objTemp,
        [`input${getCleanName(membro)}`]: ''
      }
    });
    setNovoSubmit(objTemp);
  };

  const getCleanName = (str) => {
    const removeAccents = (str) => {
      return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    };
    return removeAccents(str.split(" ").join(""));
  };

  useEffect(() => {
    if (reload === true) {
      const recarregar = async () => {
        setLoading(true);
        try {
          await Promise.all([
            fetchNomesMembros(),
            fetchItensRaci(),
            fetchCores()
          ]);
        } catch (err) {
          console.error("Erro ao recarregar dados:", err);
        } finally {
          setLoading(false);
          setReload(false);
        }
      };

      recarregar();
    }
  }, [reload]);


  useEffect(() => {
    const carregarDados = async () => {
      try {
        await Promise.all([
          fetchNomesMembros(),
          fetchItensRaci(),
          fetchCores()
        ]);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, []);

  useEffect(() => {
    generateFormData();
  }, [nomesMembros])

  const handleConfirmDelete = async () => {
    if (confirmDeleteItem) {
      var getDeleteSuccess = false;
      try {
        getDeleteSuccess = await handleDelete({
          route: 'responsabilidades/raci',
          item: confirmDeleteItem,
          fetchDados: fetchItensRaci
        });
      } finally {
        if (getDeleteSuccess) {
          setExibirModal(`deleteSuccess`)
        } else {
          setExibirModal(`deleteFail`)
        }
      }
    }
    setConfirmDeleteItem(null);
  };

  const [tableHeaders, tableNames] = useMemo(() => {
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
  }, [nomesMembros])

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

  const modalLabels = {
    'deleteSuccess': 'Deletion Successful!',
    'deleteFail': 'Deletion Failed!',
    'inputsVazios': 'Fill out all fields before adding new data!',
    'itemJaUsado': 'This item has already been registered!',
    'semAprovador': 'A task needs to have one person accountable!',
    'muitoAprovador': "A task can't have more than one person accountable!",
    'semResponsavel': "A task needs to have at least one person responsible!"
  };

  const handleUpdateItem = async () => {
    setLoading(true);
    const responsabilidadesString = Object.keys(novosDados)
      .filter(key => key.startsWith('input'))
      .map(key => novosDados[key]).join(', ');
    const { area, item } = novosDados;
    const updatedItem = { _id: novosDados._id, area, item, responsabilidades: responsabilidadesString };
    try {
      await handleUpdate({
        route: 'responsabilidades/raci/update?id',
        dados: updatedItem,
        fetchDados: fetchItensRaci
      });
    } catch (error) {
      console.error("Update failed:", error);
    }
    setLoading(false);
    setLinhaVisivel();
    setNovosDados(camposVazios);
  };

  return (
    <div className="centered-container">
      {loading && <Loading />}
      <h2 className="smallTitle">RACI Matrix</h2>
      <button className="botao-bonito" style={{ width: '9rem' }} onClick={() => setVerOpcoes(!verOpcoes)}>Toggle options</button>
      <div className={styles.tabelaRaci_container}>
        <div className={styles.tabelaRaci_wrapper}>
          <table className={`${styles.tabelaRaci} tabela`}>
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
                    funcoes={{
                      enviar: enviar
                    }}
                    setExibirModal={setExibirModal}
                    tipo='cadastro' />
                </tr>
              )}
              {itensRaci.map((item, index) => (
                <tr key={index} style={{ backgroundColor: cores[item.area] }}>
                  {index === 0 || itensRaci[index - 1].area !== item.area ? (
                    <td rowSpan={calculateRowSpan(itensRaci, item.area, index)}
                      className={styles.raciTdArea}>{item.area}</td>
                  ) : null}
                  <td className={styles.raciTdItem}>{item.item}</td>
                  {linhaVisivel === item._id ? (
                    <React.Fragment>
                      <CadastroInputs
                        obj={novosDados}
                        objSetter={setNovosDados}
                        funcoes={{
                          enviar: handleUpdateItem,
                          cancelar: () => linhaVisivel === item._id ? setLinhaVisivel(null) : setLinhaVisivel(item._id)
                        }}
                        setExibirModal={setExibirModal}
                        tipo='update' />
                    </React.Fragment>
                  ) : (
                    <React.Fragment>
                      {tableHeaders.map((membro, index) => (
                        <td key={index} className='notLast'>{item.responsabilidades.split(', ')[tableHeaders.indexOf(membro)] || '-'}</td>
                      ))}
                      {verOpcoes && (
                        <td className="botoes_acoes lastMaior">

                          <button type="button"
                            onClick={() => setConfirmDeleteItem(item)}
                            disabled={!isAdmin}>❌</button>
                          <button onClick={() => {
                            linhaVisivel === item._id ? setLinhaVisivel() : setLinhaVisivel(item._id); handleUpdateClick(item)
                          }} disabled={!isAdmin}>⚙️</button>

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