import { useState } from "react"
import { importCSV } from "../../../../../../functions/importCSV";
import { useDictionary } from "../DictionaryContext";
import styles from '../../../../../../styles/modules/wbs.module.css'
import { handleReq } from "../../../../../../functions/crud_s";
import useAuth from "../../../../../../hooks/useAuth";
import { useRef } from "react";
import { ImportCSV } from "../../../../../ui/ImportCSV/ImportCSV"
import { ImportCSVFileSelector } from "../../../../../ui/ImportCSV/ImportCSVFileSelector";
import { ImportCSVConfirmPreview } from "../../../../../ui/ImportCSV/ImportCSVConfirmPreview";

export const ImportContainer = ({ setHide }) => {
    const [showTable, setShowTable] = useState(false);
    const { dicionarios, areasNames, itensNames, setIsLoading, elementosWBSMap, refetchData } = useDictionary();
    const { token, user } = useAuth();

    const tableHeaders = useRef(["Area", "Item", "Description", "Purpose",
        "Premises", "Restrictions",
        "Expected Resources and Costs",
        "Acceptance Criteria", "Inspection", "Timing",
        "Responsible for Criteria", "Responsible for Approval"]);

    const uploadImport = async (lines) => {
        setIsLoading(true);

        const existingLinesIds = [];
        const editingLines = [];
        const newLines = [];

        lines.forEach(l => {
            const dicionario = dicionarios.find(d => (
                l["Area"] == d.wbs_item.wbs_area.name &&
                l["Item"] == d.wbs_item.name
            ))

            if (dicionario) {
                if (!(l["Description"] == dicionario.description &&
                    l["Purpose"] == dicionario.purpose &&
                    l["Premises"] == dicionario.premises &&
                    l["Restrictions"] == dicionario.restrictions &&
                    l["Expected Resources and Costs"] == dicionario.resources &&
                    l["Acceptance Criteria"] == dicionario.criteria &&
                    l["Inspection"] == dicionario.inspection &&
                    l["Timing"] == dicionario.timing &&
                    l["Responsible for Criteria"] == dicionario.responsible &&
                    l["Responsible for Approval"] == dicionario.approval_responsible)
                ) {
                    editingLines.push([dicionario.id, l]);
                }
                existingLinesIds.push(dicionario.id);
            } else newLines.push(l);
        })

        const deleteFunctionsArr = [];
        dicionarios.forEach(d => {
            const dicionario = existingLinesIds.find(i => i == d.id);
            if (!dicionario) deleteFunctionsArr.push(
                handleReq({
                    table: 'wbs_dictionary',
                    route: 'delete',
                    token,
                    data: { id: d.id },
                })
            )
        })

        setHide(true);

        await Promise.all(deleteFunctionsArr);

        const submitFunctionsArr = newLines.map(l => (
            handleReq({
                table: 'wbs_dictionary',
                route: 'create',
                token,
                data: {
                    item_id: elementosWBSMap.get(l["Area"]).get(l["Item"]),
                    description: l["Description"],
                    purpose: l["Purpose"],
                    criteria: l["Acceptance Criteria"],
                    inspection: l["Inspection"],
                    timing: l["Timing"],
                    responsible: l["Responsible for Criteria"],
                    approval_responsible: l["Responsible for Approval"],
                    premises: l["Premises"],
                    restrictions: l["Restrictions"],
                    resources: l["Expected Resources and Costs"],
                    user_id: user?.id
                },
            })
        )
        )

        const updateFunctionsArr = editingLines.map(([id, l]) =>
            handleReq({
                table: 'wbs_dictionary',
                route: 'update',
                token,
                data: {
                    id,
                    description: l["Description"],
                    purpose: l["Purpose"],
                    criteria: l["Acceptance Criteria"],
                    inspection: l["Inspection"],
                    timing: l["Timing"],
                    responsible: l["Responsible for Criteria"],
                    approval_responsible: l["Responsible for Approval"],
                    premises: l["Premises"],
                    restrictions: l["Restrictions"],
                    resources: l["Expected Resources and Costs"],
                    user_id: user?.id
                }
            })
        )

        await Promise.all([...submitFunctionsArr, ...updateFunctionsArr]);

        await refetchData();

        setIsLoading(false);

    }

    const areLinesValid = (lines) => {
        const unknownAreas = [];
        const unknownItems = [];
        const analyzedLines = new Set();
        const repeatedLines = []

        for (const line in lines) {
            if (!elementosWBSMap.has(lines[line]["Area"])) {
                unknownAreas.push(lines[line]["Area"]);
            } else if (!elementosWBSMap.get(lines[line]["Area"]).has(lines[line]["Item"])) {
                unknownItems.push(`${lines[line]["Area"]} - ${lines[line]["Item"]}`);
            }
            
            const areaAndItem = `${lines[line]["Area"]} - ${lines[line]["Item"]}`;
            if(analyzedLines.has(areaAndItem)){
                repeatedLines.push(areaAndItem);
            } else {
                analyzedLines.add(areaAndItem);
            }
        }

        let error = "";
        if (unknownAreas.length !== 0) {
            error += `Your spreadsheet has areas not registered in the WBS (${unknownAreas.join(", ")}). `
        }
        if (unknownItems.length !== 0) {
            error += `Your spreadsheet has items not registered in the WBS (${unknownItems.join(", ")}). `
        }
        if(repeatedLines.length !== 0){
            error += `Some items appear in multiple lines (${repeatedLines.join(", ")}).`
        }
        
        const hasError = error !== "";
        return [hasError, error];
    }

    return (
        <ImportCSV
            setHide={setHide}
            tableHeaders={tableHeaders.current}
            uploadImport={uploadImport}
            areLinesValid={areLinesValid}
        >
            <ImportCSVFileSelector />
            <ImportCSVConfirmPreview/>
        </ImportCSV>
    )
}