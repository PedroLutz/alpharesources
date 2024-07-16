import React, { useEffect, useState } from 'react';
import styles from '../../styles/modules/wbs.module.css';
import Loading from '../Loading';
import { fetchData, handleUpdate, handleDelete, handleSubmit } from '../../functions/crud';
import Modal from '../Modal';
import BlocoInputs from './BlocoInputs';
import { cleanForm } from '../../functions/general';
import { set } from 'lodash';
import { type } from 'os';

const WBS = () => {
  const [elementosPorArea, setElementosPorArea] = useState([]);
  const [elementos, setElementos] = useState([]);
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
  };
  const [reload, setReload] = useState(false);
  const [novoSubmit, setNovoSubmit] = useState(camposVazios);
  const [submitEmArea, setSubmitEmArea] = useState(camposVazios);
  const [novosDados, setNovosDados] = useState(camposVazios);

  const enviar = async (e) => {
    e.preventDefault();
    handleSubmit({
      route: 'wbs',
      dados: novoSubmit,
    });
    setReload(true);
    cleanForm(novoSubmit, setNovoSubmit);
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
    cleanForm(camposVazios, setNovoSubmit);
  }

  const handleUpdateClick = (item) => {
    setConfirmUpdateItem(item);
    if (typeof (item) === 'object') {
      setNovosDados({
        item: item.item,
        area: item.area
      });
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

  useEffect(() => {
    setReload(false);
    fetchElementos();
  }, [reload]);

  const checkDados = (tipo) => {
    setExibirModal(tipo); return;
  };
  const modalLabels = {
    'inputsVazios': 'Fill out all fields before adding new data!',
    'elementoUsado': 'This WBS item is used somewhere else!'
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
  }, []);

  const handleUpdateItem = async () => {
    if (confirmUpdateItem) {
      if (typeof (confirmUpdateItem) == 'object') {
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
        {gruposDeAreas.map((grupo, index) => (
          <div className={styles.wbsContainer} key={index}>
            {(index == 0 && verOpcoes) &&
              <BlocoInputs
                tipo='cadastroArea'
                obj={novoSubmit}
                objSetter={setNovoSubmit}
                funcao={enviar}
                checkDados={checkDados}
              />}
            {grupo.map(({ area, elementos }) => (
              <div className={styles.wbsArea} key={area}>
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
                      />
                    ) : (
                      <React.Fragment>
                        <h3>{area}</h3>
                        <button onClick={() => { handleUpdateClick(area); setLinhaVisivel(area); }}>U</button>
                      </React.Fragment>
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
                                  checkDados={checkDados} />
                              </React.Fragment>
                            ) : (
                              <React.Fragment>{item.item}
                                <button onClick={() => { handleUpdateClick(item); setLinhaVisivel(item); }}>U</button>
                                <button onClick={() => setConfirmDeleteItem(item)}>D</button>
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
                    <BlocoInputs
                      tipo='cadastroItem'
                      area={area}
                      obj={submitEmArea}
                      objSetter={setSubmitEmArea}
                      funcao={enviarEmArea}
                      checkDados={checkDados} />}
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
      <button onClick={() => setVerOpcoes(!verOpcoes)}>Toggle Options</button>
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