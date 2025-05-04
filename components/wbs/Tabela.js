import React, { useEffect, useState, useContext } from 'react';
import styles from '../../styles/modules/wbs.module.css';
import Loading from '../Loading';
import { fetchData, handleUpdate, handleDelete, handleSubmit } from '../../functions/crud';
import Modal from '../Modal';
import BlocoInputs from './BlocoInputs';
import { cleanForm } from '../../functions/general';
import { AuthContext } from '../../contexts/AuthContext';

const WBS = () => {
  const [elementosPorArea, setElementosPorArea] = useState([]);
  const [elementos, setElementos] = useState([]);
  const [cores, setCores] = useState([]);
  const [linhaVisivel, setLinhaVisivel] = useState({});
  const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
  const [verOpcoes, setVerOpcoes] = useState(false);
  const [confirmUpdateItem, setConfirmUpdateItem] = useState(null);
  const [actionChoice, setActionChoice] = useState(null);
  const [exibirModal, setExibirModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const camposVazios = {
    item: '',
    area: '',
    cor: ''
  };
  const [reload, setReload] = useState(false);
  const [novoSubmit, setNovoSubmit] = useState(camposVazios);
  const [submitEmArea, setSubmitEmArea] = useState(camposVazios);
  const [novosDados, setNovosDados] = useState(camposVazios);
  const {isAdmin} = useContext(AuthContext)

  const enviar = async (e) => {
    e.preventDefault();
    handleSubmit({
      route: 'wbs',
      dados: novoSubmit,
    });
    setReload(true);
    cleanForm(novoSubmit, setNovoSubmit, camposVazios);
  };

  const enviarEmArea = async (e, area) => {
    e.preventDefault();
    const item = submitEmArea[`novo${area}`]?.item;
    handleSubmit({
      route: 'wbs',
      dados: {
        area: area,
        item: item
      }
    })
    setReload(true);
    cleanForm(novoSubmit, setNovoSubmit, camposVazios);
  }

  const handleUpdateClick = (item) => {
    console.log(item)
    setConfirmUpdateItem(item);
    if (typeof (item) === 'object') {
      if (!item.cor) {
        setNovosDados({
          item: item.item,
          area: item.area
        });
      } else {
        setNovosDados({
          cor: item.cor,
          area: item.area
        })
      }
    } else {
      setNovosDados({
        area: item,
        oldArea: item
      })
    }
  };

  const fetchElementos = async () => {
    try {
      const data = await fetchData('wbs/get/all');
      const areas = {};
      data.elementos.forEach((elemento) => {
        if (!areas[elemento.area]) {
          areas[elemento.area] = [];
        }
        areas[elemento.area].push(elemento);
      });
      setElementos(data.elementos);
      setElementosPorArea(areas);
    } finally {
      setLoading(false);
    }
  };

  const fetchCores = async () => {
    const data = await fetchData('wbs/get/cores');
    var cores = {};
    data.areasECores.forEach((area) => {
      cores = { ...cores, [area._id]: area.cor[0] ? area.cor[0] : '' }
    })
    setCores(cores);
  }

  const checkDados = (tipo) => {
    setExibirModal(tipo); return;
  };
  const modalLabels = {
    'inputsVazios': 'Fill out all fields before adding new data!',
    'elementoUsado': 'This WBS item is used somewhere else!',
    'nomeRepetido' : 'This name is already used in another item!'
  };

  const checkIfUsed = async (item) => {
    var found;
    await fetch(`/api/wbs/get/isItemUsed?nome=${String(item.item)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ area: item.area, item: item.item }),
    })
      .then(response => response.json()).then(data => { found = data.found });
    return found;
  }

  const handleConfirmDelete = async () => {
    const isUsed = await checkIfUsed(confirmDeleteItem);
    if (isUsed) {
      setConfirmDeleteItem(null);
      setExibirModal('elementoUsado');
      return;
    }
    if (confirmDeleteItem) {
      handleDelete({
        route: 'wbs',
        item: confirmDeleteItem,
        fetchDados: fetchElementos
      });
    }
    setConfirmDeleteItem(null);
  };
  useEffect(() => {
    fetchElementos();
    fetchCores();
  }, []);

  const isNameUsed = (obj) => {
    return elementos.some(objeto => objeto.item === obj.item);
  }

  const handleUpdateCor = async () => {
    if(confirmUpdateItem){
      setReload(true);
        linhaVisivel === confirmUpdateItem ? setLinhaVisivel() : setLinhaVisivel(confirmUpdateItem);
        try {
          const response = await fetch(`/api/wbs/update/cor`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(novosDados),
          });

          if (response.status === 200) {
            return;
          } else {
            console.error(`Erro ao atualizar cor`);
          }
        } catch (error) {
          console.error(`Erro ao atualizar cor, ${error}`);
        }
    }
  }

  const handleUpdateItem = async () => {
    if (confirmUpdateItem) {
      if (typeof (confirmUpdateItem) == 'object') {
          setLoading(true);
          const updatedItem = { ...confirmUpdateItem, ...novosDados };
          const updatedElementos = elementos.map(item =>
            item._id === updatedItem._id ? { ...updatedItem } : item
          );

          setElementos(updatedElementos);
          setConfirmUpdateItem(null);
          linhaVisivel === confirmUpdateItem._id ? setLinhaVisivel() : setLinhaVisivel(confirmUpdateItem._id);
          try {
            await handleUpdate({
              route: 'wbs/update/item?id',
              dados: updatedItem,
              item: confirmUpdateItem
            });
          } catch (error) {
            setElementos(elementos);
            setConfirmUpdateItem(confirmUpdateItem);
            console.error("Update failed:", error);
          }
          setReload(true);
          setLoading(false);
      } else {
        setReload(true);
        linhaVisivel === confirmUpdateItem ? setLinhaVisivel() : setLinhaVisivel(confirmUpdateItem);
        try {
          const response = await fetch(`/api/wbs/update/area`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(novosDados),
          });

          if (response.status === 200) {
            return;
          } else {
            console.error(`Erro ao atualizar ${o.route}`);
          }
        } catch (error) {
          console.error(`Erro ao atualizar ${o.route}, ${error}`);
        }
      }
    }
  };

  useEffect(() => {
    setReload(false);
    fetchElementos();
    fetchCores();
  }, [reload]);

  const renderWBS = () => {
    const areasPorLinha = 4;
    const gruposDeAreas = Object.keys(elementosPorArea).reduce((grupos, area, index) => {
      var grupoIndex;
      if (verOpcoes) {
        if (index < 3) {
          grupoIndex = 0;
        } else {
          grupoIndex = Math.floor((index - 3) / areasPorLinha) + 1;
        }
      } else {
        grupoIndex = Math.floor((index) / areasPorLinha);
      }

      if (!grupos[grupoIndex]) {
        grupos[grupoIndex] = [];
      }
      grupos[grupoIndex].push({ area, elementos: elementosPorArea[area] });
      return grupos;
    }, []);


    return (
      <div>
        {gruposDeAreas.length === 0 && (
          <BlocoInputs
            tipo='cadastroArea'
            obj={novoSubmit}
            objSetter={setNovoSubmit}
            funcao={enviar}
            checkDados={checkDados}
          />
        )}
        {gruposDeAreas.map((grupo, index) => (
          <div className={styles.wbsContainer} key={index}>
            {(index == 0 && verOpcoes) &&
              <BlocoInputs
                tipo='cadastroArea'
                obj={novoSubmit}
                objSetter={setNovoSubmit}
                funcao={enviar}
                checkDados={checkDados}
                isNameUsed={isNameUsed}
              />}
            {grupo.map(({ area, elementos }) => (
              <div className={styles.wbsArea} key={area} style={{ backgroundColor: cores[area] }}>
                {verOpcoes ? (
                  <React.Fragment>
                    {linhaVisivel === area ? (
                      <BlocoInputs
                        tipo='updateArea'
                        obj={novosDados}
                        objSetter={setNovosDados}
                        funcao={{
                          funcao1: handleUpdateItem,
                          funcao2: () => linhaVisivel === area ? setLinhaVisivel() : setLinhaVisivel(item._id)
                        }}
                        checkDados={checkDados}
                        isNameUsed={isNameUsed}
                      />
                    ) : (
                      <React.Fragment>
                        <div className={styles.areaTitle}>
                          <h3>{area}</h3>
                          <button
                            onClick={() => {
                              handleUpdateClick(area); setLinhaVisivel(area);
                            }} disabled={!isAdmin}>⚙️</button>
                        </div>
                      </React.Fragment>
                    )}
                    {linhaVisivel === `${area}Cor` ? (
                      <BlocoInputs
                        tipo='updateCor'
                        obj={novosDados}
                        objSetter={setNovosDados}
                        funcao={{
                          funcao1: handleUpdateCor,
                          funcao2: () => linhaVisivel === `${area}Cor` ? setLinhaVisivel() : setLinhaVisivel(item._id)
                        }}
                        checkDados={checkDados}
                        isNameUsed={isNameUsed}
                      />
                    ) : (
                      <div className={styles.areaTitle} style={{ marginBottom: '1rem' }}>
                        Change color
                        <button
                          onClick={() => {
                            handleUpdateClick({ area: area, cor: cores[area] ? cores[area] : '' }); setLinhaVisivel(`${area}Cor`);
                          }} disabled={!isAdmin}>⚙️</button>
                      </div>
                    )}
                  </React.Fragment>
                ) : (
                  <h3>{area}</h3>
                )}
                <div className={styles.wbsItems}>
                  {elementos
                    .sort((a, b) => a.codigo - b.codigo)
                    .map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        className={styles.wbsItem}
                      >
                        {verOpcoes ? (
                          <React.Fragment>
                            {linhaVisivel === item ? (
                              <React.Fragment>
                                <BlocoInputs
                                  tipo='updateItem'
                                  obj={novosDados}
                                  objSetter={setNovosDados}
                                  funcao={{
                                    funcao1: handleUpdateItem,
                                    funcao2: () => linhaVisivel === item._id ? setLinhaVisivel() : setLinhaVisivel(item._id)
                                  }}
                                  checkDados={checkDados}
                                  isNameUsed={isNameUsed} />
                              </React.Fragment>
                            ) : (
                              <React.Fragment>
                                {item.item}
                                <button onClick={() => { handleUpdateClick(item); setLinhaVisivel(item); }} disabled={!isAdmin}>⚙️</button>
                                <button onClick={() => setConfirmDeleteItem(item)} disabled={!isAdmin}>❌</button>
                              </React.Fragment>
                            )}
                          </React.Fragment>
                        ) : (
                          <React.Fragment>
                            {item.item}
                          </React.Fragment>
                        )}
                      </div>
                    ))}
                  {verOpcoes &&
                    <React.Fragment>
                      <BlocoInputs
                        tipo='cadastroItem'
                        area={area}
                        obj={submitEmArea}
                        objSetter={setSubmitEmArea}
                        funcao={enviarEmArea}
                        checkDados={checkDados}
                        isNameUsed={isNameUsed} />
                    </React.Fragment>
                  }
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="centered-container" style={{ marginTop: '20px' }}>
      {loading && <Loading />}
      <button
        className="botao-padrao"
        style={{ width: '8rem' }}
        onClick={() => setVerOpcoes(!verOpcoes)}
      >Toggle Options</button>
      {renderWBS()}

      {actionChoice && (
        <Modal objeto={{
          titulo: 'What do you wish to do?',
          botao1: {
            funcao: () => { handleUpdateClick(actionChoice); setActionChoice(null) }, texto: 'Update item'
          },
          botao2: {
            funcao: () => { setConfirmDeleteItem(actionChoice); setActionChoice(null) }, texto: 'Delete item'
          },
          botao3: {
            funcao: () => setActionChoice(null), texto: 'Cancel'
          }
        }} />
      )}

      {confirmDeleteItem && (
        <Modal objeto={{
          titulo: `Are you sure you want to delete "${confirmDeleteItem.area} - ${confirmDeleteItem.item}"?`,
          botao1: {
            funcao: handleConfirmDelete, texto: 'Confirm'
          },
          botao2: {
            funcao: () => setConfirmDeleteItem(null), texto: 'Cancel'
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

export default WBS;