import React, { useEffect, useState, useMemo } from 'react';
import styles from '../../../../styles/modules/responsabilidades.module.css'
import Loading from '../../../ui/Loading';
import Modal from '../../../ui/Modal';
import CadastroInputs from './CadastroInputs';
import { cleanForm } from '../../../../functions/general';
import useAuth from '../../../../hooks/useAuth';
import usePerm from '../../../../hooks/usePerm';
import { handleFetch, handlePostFetch, handleReq } from '../../../../functions/crud_s';
import HelpBubble from "../../../ui/HelpBubble/responsabilidades/Raci";
import Link from 'next/link';

const Tabela = () => {
  const { user, token } = useAuth();
  const { isEditor } = usePerm();

  const [itensRaci, setItensRaci] = useState([]);
  const [nomesMembros, setNomesMembros] = useState([]);
  const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
  const [verOpcoes, setVerOpcoes] = useState(false);
  const [loading, setLoading] = useState(true);
  const [exibirModal, setExibirModal] = useState(null);
  const [linhaVisivel, setLinhaVisivel] = useState({});
  const [reload, setReload] = useState(false);
  const [cores, setCores] = useState({});
  const [loaded, setLoaded] = useState(false);
  const camposVazios = {
    item_id: "",
  }
  const [novoSubmit, setNovoSubmit] = useState(camposVazios);
  const [novosDados, setNovosDados] = useState(camposVazios);
  const [oldDados, setOldDados] = useState(camposVazios);
  const [showHelp, setShowHelp] = useState(false);

  const handleUpdateClick = (item) => {
    let obj = { item_id: item.item_id };
    item?.raci?.forEach((r) => {
      obj["input" + r.member_id] = r.responsibility;
    })
    setNovosDados(obj);
    setOldDados(item);
  };

  const fetchCores = async () => {
    const data = await handleFetch({
      table: "wbs_area",
      query: 'colors',
      token
    });
    var cores = {};
    data.data.forEach((area) => {
      cores = { ...cores, [area.name]: area.color || '' }
    })
    setCores(cores);
  }

  const fetchItensRaci = async () => {
    const data = await handlePostFetch({
      table: "raci_item",
      query: 'all_ordered',
      token,
      data: { uid: user.id },
    })
    setItensRaci(data.data);
  };

  const validarDados = (obj) => {
    if (!Object.values(obj).some(v => v == "accountable")) {
      setExibirModal('semAprovador');
      return false;
    }
    if (!Object.values(obj).some(v => v == "responsible")) {
      setExibirModal('semResponsavel');
      return false;
    }
    if (Object.values(obj).reduce((acc, cur) => {
      if (cur == 'accountable') acc++;
      return acc;
    }, 0) > 1) {
      setExibirModal('muitoAprovador');
      return false;
    }
    return true;
  }

  const enviar = async () => {
    if (!validarDados(novoSubmit)) return false;
    try {
      for (let key in novoSubmit) {
        if (key != 'item_id') {
          const responsibility = novoSubmit[key];
          const member_id = key.split("input")[1];
          await handleReq({
            table: 'raci_item',
            route: 'create',
            token,
            data: { item_id: novoSubmit.item_id, member_id, responsibility, user_id: user.id },
          });
        }
      }
      nomesMembros.forEach((membro) => {
        setNovoSubmit((prevState) => ({
          ...prevState,
          ['input' + membro.id]: ''
        }));
      });
    } finally {
      cleanForm(novoSubmit, setNovoSubmit, camposVazios);
      setReload(true);
      return true;
    }
  };

  const checkItemDisponivel = (item_id) => {
    if (itensRaci.length == 0) {
      return true;
    }
    return !itensRaci.some(c => c.item_id == item_id && c.raci.length != 0);
  }

  const checkAreaDisponivel = (area_id, item_id) => {
    if (itensRaci.length === 0) return true;

    const itensDaArea = itensRaci.filter(c => c.area_id === area_id).map(c => c.item_id);

    if (itensDaArea.length === 0) {
      return true;
    }

    if (!itensDaArea.includes(item_id)) {
      return true;
    }

    return false;
  };


  const fetchNomesMembros = async () => {
    const data = await handleFetch({
      table: "member",
      query: 'names',
      token
    });
    setNomesMembros(data.data);
  };

  const generateFormData = () => {
    var objTemp = novoSubmit;
    nomesMembros.forEach((membro) => {
      objTemp = {
        ...objTemp,
        [`input${membro.id}`]: ''
      }
    });
    setNovoSubmit(objTemp);
  };

  useEffect(() => {
    if (reload === true) {
      const recarregar = async () => {
        setLoaded(false);
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
          setLoaded(false);
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
      try {
        for (const item of confirmDeleteItem?.raci ?? []) {
          await handleReq({
            table: "raci_item",
            route: 'delete',
            token,
            data: { id: item.id },
          });
        }
      } finally {
        setExibirModal("deleteSuccess");
        setConfirmDeleteItem(null);
        setReload(true);
      }
    }
  };

  const [tableHeaders, tableNames] = useMemo(() => {
    const firstNames = new Map();
    const fullNames = [];
    const headers = [];

    nomesMembros.forEach((membro) => {
      const nomeCompleto = membro.name;
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
      if (itensRaci[i].area_name === currentArea) {
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
    if (!validarDados(novosDados)) return;
    setLoading(true);
    for (let key in novosDados) {
      if (key != 'item_id' && key != 'id') {
        const responsibility = novosDados[key];
        const member_id = key.split("input")[1];
        const dadoOriginal = oldDados?.raci?.find(i => i.member_id == member_id) || undefined;
        if (dadoOriginal !== undefined && dadoOriginal?.responsibility != responsibility) {
          await handleReq({
            table: 'raci_item',
            route: 'update',
            token,
            data: { id: dadoOriginal.id, item_id: novosDados.item_id, member_id, responsibility, user_id: user.id },
          });
        } else {
          await handleReq({
            table: 'raci_item',
            route: 'create',
            token,
            data: { item_id: novosDados.item_id, member_id, responsibility, user_id: user.id },
          });
        }
      }
    }
    setReload(true);
    setLoading(false);
    setLinhaVisivel();
    setNovosDados(camposVazios);
  };

  return (
    <div className="centered-container">
      {loading && <Loading />}
      {showHelp && <HelpBubble setShowHelp={setShowHelp} />}
      <h2 className="smallTitle">RACI Matrix <button onClick={() => setShowHelp(true)}>❔</button></h2>
      <button className="botao-bonito" style={{ width: '9rem' }} onClick={() => setVerOpcoes(!verOpcoes)}>Toggle options</button>
      {tableHeaders.length == 0 ? (
        <div className={styles.no_members} style={{ marginBottom: '1rem' }}>
          <h4>Please register all team members in <Link href="/pags/responsibilities/members">Team members</Link> beforing using the RACI matrix.</h4>
        </div>
      ) : (
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
                        enviar,
                        checkItemDisponivel,
                        checkAreaDisponivel
                      }}
                      setExibirModal={setExibirModal}
                      isEditor={isEditor}
                      loaded={loaded}
                      tipo='cadastro' />
                  </tr>
                )}
                {itensRaci.map((item, index) => (
                  <tr key={index} style={{ backgroundColor: item?.area_color }}>
                    {index === 0 || itensRaci[index - 1].area_name !== item?.area_name ? (
                      <td rowSpan={calculateRowSpan(itensRaci, item?.area_name, index)}
                        className={styles.raciTdArea}>{item?.area_name}</td>
                    ) : null}
                    <td className={styles.raciTdItem}>{item.item_name}</td>
                    {linhaVisivel === item.item_id ? (
                      <React.Fragment>
                        <CadastroInputs
                          obj={novosDados}
                          objSetter={setNovosDados}
                          funcoes={{
                            enviar: handleUpdateItem,
                            cancelar: () => setLinhaVisivel(null),
                            checkItemDisponivel,
                            checkAreaDisponivel
                          }}
                          setExibirModal={setExibirModal}
                          loaded={loaded}
                          isEditor={isEditor}
                          tipo='update' />
                      </React.Fragment>
                    ) : (
                      <React.Fragment>
                        {nomesMembros.map((membro, index) => {
                          const membroObj = item.raci?.find(m => m.member_id === membro.id)
                          return <td key={index}>{membroObj?.responsibility[0].toUpperCase() || "-"}</td>
                        })}
                        {verOpcoes && (
                          <td className="botoes_acoes lastMaior">

                            <button type="button"
                              onClick={() => setConfirmDeleteItem(item)}
                              disabled={!isEditor}>❌</button>
                            <button onClick={() => {
                              setLinhaVisivel(item.item_id); handleUpdateClick(item)
                            }} disabled={!isEditor}>⚙️</button>

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
      )}
      {confirmDeleteItem && (
        <Modal objeto={{
          titulo: `Are you sure you want to delete "${confirmDeleteItem.area_name} - ${confirmDeleteItem.item_name}"?`,
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