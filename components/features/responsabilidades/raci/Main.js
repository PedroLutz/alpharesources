import { useState } from 'react';
import styles from '../../../../styles/modules/responsabilidades.module.css'
import Loading from '../../../ui/Loading';
import Modal from '../../../ui/Modal';
import useAuth from '../../../../hooks/useAuth';
import { handleReq } from '../../../../functions/crud_s';
import HelpBubble from "../../../ui/HelpBubble/responsabilidades/Raci";
import Link from 'next/link';
import { RaciProvider, useRaci } from './data/RaciContext';
import DynamicHeader from './blocks/DynamicHeader';
import NewRaciCreator from './forms/NewRaciCreator';
import RaciBlock from './blocks/RaciBlock';
import { useToolbar } from '../../../../hooks/useToolbar';
import { useCallback } from 'react';
import exportCSV from '../../../../functions/exportCsv';
import { useEffect } from 'react';

const modalLabels = {
  'deleteSuccess': 'Deletion Successful!',
  'deleteFail': 'Deletion Failed!',
  'inputsVazios': 'Fill out all fields before adding new data!',
  'itemJaUsado': 'This item has already been registered!',
  'semAprovador': 'A task needs to have one person accountable!',
  'muitoAprovador': "A task can't have more than one person accountable!",
  'semResponsavel': "A task needs to have at least one person responsible!"
};

const Tabela = () => {
  const { itensRaci, nomesMembros, isLoading, fetchData } = useRaci();
  const { token } = useAuth();

  const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);
  const [verOpcoes, setVerOpcoes] = useState(false);
  const [exibirModal, setExibirModal] = useState(null);
  const [showHelp, setShowHelp] = useState(false);

  const { setExportCSVClick, setHelpClick } = useToolbar();
  
  const exportToCSV = useCallback(() => {
    const headers = ["Area", "Item"];
    nomesMembros.forEach(m => {
      headers.push(m.name);
    })
    const lines = itensRaci.map(i => {
      const _lines = [
        `"${i.area_name}"`,
        `"${i.item_name}"`
      ]

      nomesMembros.forEach(m => {
        const responsibility = i.raci?.find(ir => ir.member_id == m.id)?.responsibility?.[0]?.toUpperCase() ?? "-";
        _lines.push(responsibility);
      })

      return _lines;
    }
    )
    exportCSV(headers, lines, "raci");
  }, [itensRaci, exportCSV]);

  useEffect(() => {
    setHelpClick(() => () => setShowHelp(true));
    setExportCSVClick(() => exportToCSV);
    
    return (() => {
      setHelpClick(null);
      setExportCSVClick(null);
    })
  }, [itensRaci, exportToCSV]);


  const handleConfirmDelete = async () => {
    if (confirmDeleteItem) {
      try {
        const functions = [];
        for (const item of confirmDeleteItem?.raci ?? []) {
          functions.push(handleReq({
            table: "raci_item",
            route: 'delete',
            token,
            data: { id: item.id },
          }));
        }
        await Promise.all(functions);
      } finally {
        setExibirModal("deleteSuccess");
        setConfirmDeleteItem(null);
        await fetchData();
      }
    }
  };

  return (
    <div className="centered-container">
      {isLoading && <Loading />}
      {showHelp && <HelpBubble setShowHelp={setShowHelp} />}
      <h2 className="smallTitle">RACI Matrix</h2>
      <button className="botao-bonito" style={{ width: '9rem' }} onClick={() => setVerOpcoes(!verOpcoes)}>Toggle options</button>
      {nomesMembros?.length == 0 ? (
        <div className={styles.no_members} style={{ marginBottom: '1rem' }}>
          <h4>Please register all team members in <Link href="/pags/responsibilities/members">Team members</Link> beforing using the RACI matrix.</h4>
        </div>
      ) : (
        <div className={styles.tabelaRaci_container}>
          <div className={styles.tabelaRaci_wrapper}>
            <table className={`${styles.tabelaRaci} tabela`}>
              <DynamicHeader
                verOpcoes={verOpcoes}
              />
              <tbody>
                {verOpcoes && (
                  <NewRaciCreator
                    setExibirModal={setExibirModal}
                  />
                )}
                {itensRaci.map((item, index) => (
                  <RaciBlock
                    key={item.id}
                    index={index}
                    item={item}
                    setConfirmDeleteItem={setConfirmDeleteItem}
                    setExibirModal={setExibirModal}
                    verOpcoes={verOpcoes}
                  />
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

const Main = () => {
  return (
    <RaciProvider>
      <Tabela />
    </RaciProvider>
  )
}

export default Main;