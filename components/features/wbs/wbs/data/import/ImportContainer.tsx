import { useRef, useState } from "react";
import { ImportCSV } from "../../../../../ui/ImportCSV/ImportCSV";
import { ImportCSVConfirmPreview } from "../../../../../ui/ImportCSV/ImportCSVConfirmPreview";
import { ImportCSVFileSelector } from "../../../../../ui/ImportCSV/ImportCSVFileSelector";
import useAuth from "../../../../../../hooks/useAuth";
import {useWbs} from "../WbsContext";

export const ImportContainer = ({ setHide }: { setHide: () => void }) => {
    const [showTable, setShowTable] = useState(false);
    const {setIsLoading, areasNamesToIdsMap, itemsNamesToIdsMap, areasToItemsMap} = useWbs();
    const [error, setError] = useState("");
    const { token, user } = useAuth();

    const tableHeaders = useRef(["Area", "Item"]);

    const uploadImport = async (lines) => {
        setIsLoading(true);

        const existingLinesIds = [];
        const editingLines = [];
        const newLines = [];

        const newAreas = new Set();
        const newItens = new Map<string, string[]>();

        const existingAreasIds = [];
        const existingItensIds = [];

        lines.forEach(l => {
            if(!areasNamesToIdsMap.has(l["Area"])){
                if(!newAreas.has(l["Area"])) {
                    newAreas.add(l["Area"])
                    newItens.set(l["Area"], []);
                };

                newItens.get(l["Area"]).push(l["Item"]);
                
            } else {
                existingAreasIds.push(areasNamesToIdsMap.get(l["Area"]))
                if(!areasToItemsMap.get(l["Area"]).find(i => i.name === l["Item"])){
                    if(!newItens.has(l["Area"])) newItens.set(l["Area"], []);
                    newItens.get(l["Area"]).push(l["Item"]);
                } else {
                    existingItensIds.push(itemsNamesToIdsMap.get(l["Item"]));
                }
            }
        })

        
        console.log(newAreas);
        console.log(newItens);
        console.log(existingAreasIds);
        console.log(existingItensIds); 

        // const deleteFunctionsArr = [];
        // dicionarios.forEach(d => {
        //     const dicionario = existingLinesIds.find(i => i == d.id);
        //     if (!dicionario) deleteFunctionsArr.push(
        //         handleReq({
        //             table: 'wbs_dictionary',
        //             route: 'delete',
        //             token,
        //             data: { id: d.id },
        //         })
        //     )
        // })

        // setHide(true);

        // await Promise.all(deleteFunctionsArr);

        // const submitFunctionsArr = newLines.map(l => (
        //     handleReq({
        //         table: 'wbs_dictionary',
        //         route: 'create',
        //         token,
        //         data: {
        //             item_id: elementosWBSMap.get(l["Area"]).get(l["Item"]),
        //             description: l["Description"],
        //             purpose: l["Purpose"],
        //             criteria: l["Acceptance Criteria"],
        //             inspection: l["Inspection"],
        //             timing: l["Timing"],
        //             responsible: l["Responsible for Criteria"],
        //             approval_responsible: l["Responsible for Approval"],
        //             premises: l["Premises"],
        //             restrictions: l["Restrictions"],
        //             resources: l["Expected Resources and Costs"],
        //             user_id: user?.id
        //         },
        //     })
        // )
        // )

        // const updateFunctionsArr = editingLines.map(([id, l]) =>
        //     handleReq({
        //         table: 'wbs_dictionary',
        //         route: 'update',
        //         token,
        //         data: {
        //             id,
        //             description: l["Description"],
        //             purpose: l["Purpose"],
        //             criteria: l["Acceptance Criteria"],
        //             inspection: l["Inspection"],
        //             timing: l["Timing"],
        //             responsible: l["Responsible for Criteria"],
        //             approval_responsible: l["Responsible for Approval"],
        //             premises: l["Premises"],
        //             restrictions: l["Restrictions"],
        //             resources: l["Expected Resources and Costs"],
        //             user_id: user?.id
        //         }
        //     })
        // )

        // await Promise.all([...submitFunctionsArr, ...updateFunctionsArr]);

        // await refetchData();

        setIsLoading(false);
    }
    

    return (
        <ImportCSV
            setHide={setHide}
            tableHeaders={tableHeaders.current}
            uploadImport={uploadImport}
        >
            <ImportCSVFileSelector />
            <ImportCSVConfirmPreview />
        </ImportCSV>
    )
}