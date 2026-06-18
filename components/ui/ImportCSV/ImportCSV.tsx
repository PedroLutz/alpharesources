// import { useState } from "react"
// import { importCSV } from "../../../functions/importCSV";
// import styles from '../../../styles/modules/wbs.module.css'
// import { handleReq } from "../../../functions/crud_s";
// import useAuth from "../../../hooks/useAuth";
// import { useRef } from "react";

// export type ImportContainerProps = {
//     tableStructure: Record<string, string>,
//     setHide: React.Dispatch<React.SetStateAction<boolean>>
// }

// export const ImportContainer = ({tableStructure, setHide} : ImportContainerProps) => {
//     const [showTable, setShowTable] = useState(false);
//     const [error, setError] = useState("");
//     const [lines, setLines] = useState([]);
//     const { token, user } = useAuth();

    

//     const uploadImport = async () => {
//         setIsLoading(true);

//         const existingLinesIds = [];
//         const editingLines = [];
//         const newLines = [];

//         lines.forEach(l => {
//             const dicionario = dicionarios.find(d => (
//                 l["Area"] == d.wbs_item.wbs_area.name &&
//                 l["Item"] == d.wbs_item.name
//             ))

//             if(dicionario){
//                 if(!(l["Description"] == dicionario.description &&
//                 l["Purpose"] == dicionario.purpose &&
//                 l["Premises"] == dicionario.premises &&
//                 l["Restrictions"] == dicionario.restrictions &&
//                 l["Expected Resources and Costs"] == dicionario.resources &&
//                 l["Acceptance Criteria"] == dicionario.criteria &&
//                 l["Inspection"] == dicionario.inspection &&
//                 l["Timing"] == dicionario.timing &&
//                 l["Responsible for Criteria"] == dicionario.responsible &&
//                 l["Responsible for Approval"] == dicionario.approval_responsible)
//                 ) {
//                     editingLines.push([dicionario.id, l]);
//                 }
//                 existingLinesIds.push(dicionario.id);
//             } else newLines.push(l);
//         })

//         const deleteFunctionsArr = [];
//         dicionarios.forEach(d => {
//             const dicionario = existingLinesIds.find(i => i == d.id);
//             if(!dicionario) deleteFunctionsArr.push(
//                 handleReq({
//                     table: 'wbs_dictionary',
//                     route: 'delete',
//                     token,
//                     data: { id: d.id },
//                 })
//             )
//         })

//         setHide(true);

//         await Promise.all(deleteFunctionsArr);

//         const submitFunctionsArr = newLines.map(l => (
//                 handleReq({
//                     table: 'wbs_dictionary',
//                     route: 'create',
//                     token,
//                     data: {
//                         item_id: elementosWBSMap.get(l["Area"]).get(l["Item"]),
//                         description: l["Description"],
//                         purpose: l["Purpose"],
//                         criteria: l["Acceptance Criteria"],
//                         inspection: l["Inspection"],
//                         timing: l["Timing"],
//                         responsible: l["Responsible for Criteria"],
//                         approval_responsible: l["Responsible for Approval"],
//                         premises: l["Premises"],
//                         restrictions: l["Restrictions"],
//                         resources: l["Expected Resources and Costs"],
//                         user_id: user?.id
//                     },
//                 })
//             )
//         )

//         const updateFunctionsArr = editingLines.map(([id, l]) => 
//             handleReq({
//                 table: 'wbs_dictionary',
//                 route: 'update',
//                 token,
//                 data: {
//                     id,
//                     description: l["Description"],
//                     purpose: l["Purpose"],
//                     criteria: l["Acceptance Criteria"],
//                     inspection: l["Inspection"],
//                     timing: l["Timing"],
//                     responsible: l["Responsible for Criteria"],
//                     approval_responsible: l["Responsible for Approval"],
//                     premises: l["Premises"],
//                     restrictions: l["Restrictions"],
//                     resources: l["Expected Resources and Costs"],
//                     user_id: user?.id
//                 }
//             })
//         )

//         await Promise.all([...submitFunctionsArr, ...updateFunctionsArr]);

//         await refetchData();

//         setIsLoading(false);
        
//     }

//     const areLinesValid = (lines) => {

//         const unknownAreas = [];
//         const unknownItems = [];

//         for (const line in lines) {
//             const sixSeven = lines[line]["Area"];
//             if (!elementosWBSMap.has(lines[line]["Area"])) {
//                 unknownAreas.push(lines[line]["Area"]);
//             } else if (!elementosWBSMap.get(lines[line]["Area"]).has(lines[line]["Item"])) {
//                 unknownItems.push(`${lines[line]["Area"]} - ${lines[line]["Item"]}`);
//             }
//         }

//         let _error = "";
//         if (unknownAreas.length !== 0) {
//             _error += `Your spreadsheet has areas not registered in the WBS (${unknownAreas.join(", ")}). `
//         }
//         if (unknownItems.length !== 0) {
//             _error += `Your spreadsheet has items not registered in the WBS (${unknownItems.join(", ")}).`
//         }
//         if (_error !== "") {
//             setError(_error);
//             return false;
//         }
//         return true;
//     }

//     const onSuccess = (lines) => {
//         setLines(lines);
//         if (error === "" && areLinesValid(lines)) {
//             setShowTable(true);
//         }
//     }

//     const importFromFile = (e) => {
//         const file = e.target.files?.[0];
//         if (!file) return;
//         const _lines = importCSV({
//             file, headers: tableHeaders,
//             onError: (e) => { setError(e) },
//             onSuccess
//         });
//     }

//     const fileInputRef = useRef(null);

//     const searchClick = () => {
//         fileInputRef.current?.click();
//     }

//     if (!showTable) return (
//         <div className="overlay">
//             <div className="modal">
//                 Please select a .csv file.


//                 <input ref={fileInputRef} type="file" accept=".csv" hidden onChange={importFromFile} />

//                 {error != "" && (
//                     <p style={{ color: "red" }}>{error}</p>
//                 )}
//                 <div>
//                     <button className="botao-bonito" onClick={searchClick}>Search file</button>
//                     <button className="botao-bonito" onClick={setHide}>Cancel</button>
//                 </div>
//             </div>
//         </div>
//     )

//     if (showTable) return (
//         <div className="overlay">
//             <div className="modal" style={{maxWidth: "50rem"}}>
//                 The following spreadsheet will be registered. <p style={{ color: "red" }}><b>Any data from the current spreadsheet not found in the new spreadsheet will be deleted.</b></p>
//                 <div style={{width: "100%", maxWidth: "100%", overflow: "auto"}}>
//                     <div style={{display: "block", }}>
//                         <table className={`${styles.tabelaDicionario} tabela`}>
//                             <thead>
//                                 <tr>
//                                     {tableHeaders.map((header, index) => (
//                                         <th style={{fontSize: "small"}} key={index}>{header}</th>
//                                     ))}
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {lines.map((line, index) => (
//                                     <tr key={index}>
//                                         {tableHeaders.map((header, index) => (
//                                             <td style={{textAlign: "center", fontSize: "0.7rem"}} key={index}>{line[header]}</td>
//                                         ))}
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     </div>
//                 </div>
//                 <div>
//                     <button className="botao-bonito" onClick={uploadImport}>Upload</button>
//                     <button className="botao-bonito" onClick={setHide}>Cancel</button>
//                 </div>
//             </div>
//         </div>
//     )
// }