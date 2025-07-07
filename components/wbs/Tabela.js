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
    const { isAdmin } = useContext(AuthContext)

    //essa funcao chama a funcao handleSubmit(), enviando a rota e os dados antes de forcar um reload e limpar o formulario
    const enviar = async () => {
      await handleSubmit({
        route: 'wbs',
        dados: novoSubmit,
      });
      setReload(true);
      cleanForm(novoSubmit, setNovoSubmit, camposVazios);
    };

    const isItemCadastrado = (item) => {
        return elementos.some((e) => e.item.trim() === item.trim());
    }

    //essa funcao chama a funcao handleSubmit(), enviando a rota e os dados antes de forcar um reload e limpar o formulario
    //const item serve só para facilitar a legibilidade. o valor à direita refere-se simplesmente ao item a ser armazenado.
    const enviarEmArea = async (area) => {
      const item = submitEmArea[`novo${area}`]?.item;
      await handleSubmit({
        route: 'wbs',
        dados: {
          area: area,
          item: item
        }
      })
      setReload(true);
      cleanForm(novoSubmit, setNovoSubmit, camposVazios);
    }


    //essa funcao recebe um objeto obj e insere dados em novosDados de acordo com o tipo de obj
    const handleUpdateClick = (obj) => {
      setConfirmUpdateItem(obj);
      if (obj.tipo === 'area') {
        setNovosDados({
          area: obj.area,
          oldArea: obj.area
        })
      } else if (obj.tipo === 'item') {
        setNovosDados({
          item: obj.item,
          area: obj.area
        });
      } else if (obj.tipo === 'cor') {
        setNovosDados({
          cor: obj.cor,
          area: obj.area
        })
      }
    };


    //essa funcao le os elementos no banco de dados, os agrupa por area em uma array e os coloca no state elementos
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

    //essa funcao le as cores no banco de dados, armazenando-a no state cores
    const fetchCores = async () => {
      const data = await fetchData('wbs/get/cores');
      const novasCores = data.areasECores.reduce((acc, area) => {
        acc[area._id] = area.cor[0] || '';
        return acc;
      }, {});
      setCores(novasCores);
    }

    const modalLabels = {
      'inputsVazios': 'Fill out all fields before adding new data!',
      'elementoUsado': 'This WBS item is used somewhere else!',
      'nomeRepetido': 'This name is already used in another item!'
    };


    //a funcao recebe um item e chama a rota api para pesquisar se esse item
    //esta sendo usado em alguma outra area do sistema, retornando true ou false
    const checkIfUsed = async (item) => {
      var found;
      await fetch(`/api/wbs/get/isItemUsed?nome=${String(item.item)}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ area: item.area, item: item.item }),
      })
        .then(response => response.json()).then(data => { found = data.found });
      return found;
    }


    //a funcao chama checkIfUsed, avisando o usuario caso seja true,
    //e deletando o item caso seja false, chamando a funcao handleDelete para isso
    const handleConfirmDelete = async () => {
      const isUsed = await checkIfUsed(confirmDeleteItem);
      if (isUsed) {
        setConfirmDeleteItem(null);
        setExibirModal('elementoUsado');
        return;
      }
      if (confirmDeleteItem) {
        await handleDelete({
          route: 'wbs',
          item: confirmDeleteItem,
          fetchDados: fetchElementos
        });
      }
      setConfirmDeleteItem(null);
    };


    //esse useEffect é executado apenas na primeira vez q o codigo roda
    useEffect(() => {
      fetchElementos();
      fetchCores();
    }, []);

    //essa funcao realiza o update da cor acessando a rota API adequada
    const handleUpdateCor = async () => {
      if (confirmUpdateItem) {
        linhaVisivel === confirmUpdateItem ? setLinhaVisivel() : setLinhaVisivel(confirmUpdateItem);
        try {
          const response = await fetch(`/api/wbs/update/cor`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(novosDados),
          });

          if (response.ok) {
            setReload(true);
          } else {
            console.error(`Erro do servidor ao atualizar cor: status ${response.status}`);
          }
        } catch (error) {
          console.error(`Erro de rede/execução ao atualizar cor:`, error);
        }
      }
      
    }


    // essa funcao atualiza um item especifico (se confirmUpdateItem.tipo for "item")
    // ou uma area inteira (se for "area"). antes de fazer de fato o update,
    // realiza um tratamento de dados para garantir que o objeto enviado tenha
    // apenas os campos que existem no modelo. para fazer o update, chama handleUpdate()
    const handleUpdateItem = async () => {
      if (confirmUpdateItem) {
        if (confirmUpdateItem.tipo === 'item') {
          
          delete confirmUpdateItem.tipo;
          const updatedItem = { _id: confirmUpdateItem._id, ...novosDados };
          setLoading(true);
          try {
            await handleUpdate({
              route: 'wbs/update/item?id',
              dados: updatedItem,
            });
          } catch (error) {
            console.error("Update failed:", error);
          }
          setReload(true);

        } else {
          try {
            const response = await fetch(`/api/wbs/update/area`, {
              method: 'PUT',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(novosDados),
            });

            if (response.status === 200) {
              setReload(true);
              setLoading(false);
              setNovosDados(camposVazios);
              setLinhaVisivel();
            } else {
              console.error(`Erro ao atualizar WBS`);
            }
          } catch (error) {
            console.error(`Erro ao atualizar WBS, ${error}`);
          }
        }
      }
    };


    //esse useEffect só executa quando reload é true.
    useEffect(() => {
      if (reload) {
        setReload(false);
        fetchElementos();
        fetchCores();
      }
    }, [reload]);


    //essa funcao quebra em linhas o grafico da WBS e o exibe
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
              funcoes={{ enviar, isItemCadastrado }}
              setExibirModal={setExibirModal}
            />
          )}

          {gruposDeAreas.map((grupo, index) => (
            <div className={styles.wbsContainer} key={index}>

              {(index == 0 && verOpcoes) &&
                <BlocoInputs
                  tipo='cadastroArea'
                  obj={novoSubmit}
                  objSetter={setNovoSubmit}
                  funcoes={{ enviar, isItemCadastrado }}
                  setExibirModal={setExibirModal}
                />
              }

              {grupo.map(({ area, elementos }) => (
                <div className={styles.wbsArea} key={area} style={{ backgroundColor: cores[area] }}>

                  {verOpcoes ? (
                    <React.Fragment>
                      {linhaVisivel === area ? (
                        <BlocoInputs
                          tipo='updateArea'
                          obj={novosDados}
                          objSetter={setNovosDados}
                          funcoes={{
                            enviar: handleUpdateItem,
                            cancelar: () => linhaVisivel === area ? setLinhaVisivel() : setLinhaVisivel(item._id)
                          }}
                          setExibirModal={setExibirModal}
                        />
                      ) : (
                        <React.Fragment>
                          <div className={styles.areaTitle}>
                            <h3>{area}</h3>
                            <button
                              onClick={() => {
                                handleUpdateClick({ area: area, tipo: 'area' }); setLinhaVisivel(area);
                              }} disabled={!isAdmin}>⚙️</button>
                          </div>
                        </React.Fragment>
                      )}
                      {linhaVisivel === `${area}Cor` ? (
                        <BlocoInputs
                          tipo='updateCor'
                          obj={novosDados}
                          objSetter={setNovosDados}
                          funcoes={{
                            enviar: handleUpdateCor,
                            cancelar: () => linhaVisivel === `${area}Cor` ? setLinhaVisivel() : setLinhaVisivel(item._id)
                          }}
                          setExibirModal={setExibirModal}
                        />
                      ) : (
                        <div className={styles.areaTitle} style={{ marginBottom: '1rem' }}>
                          Change color
                          <button
                            onClick={() => {
                              handleUpdateClick({ area: area, cor: cores[area] ? cores[area] : '', tipo: 'cor' }); setLinhaVisivel(`${area}Cor`);
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
                                    funcoes={{
                                      isItemCadastrado,
                                      enviar: handleUpdateItem,
                                      cancelar: () => linhaVisivel === item._id ? setLinhaVisivel() : setLinhaVisivel(item._id)
                                    }}
                                    setExibirModal={setExibirModal}/>
                                </React.Fragment>
                              ) : (
                                <React.Fragment>
                                  {item.item}
                                  <button onClick={() => { handleUpdateClick({ ...item, tipo: 'item' }); setLinhaVisivel(item); }} disabled={!isAdmin}>⚙️</button>
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
                          funcoes={{
                            isItemCadastrado,
                            enviar: enviarEmArea
                          }}
                          setExibirModal={setExibirModal} />
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