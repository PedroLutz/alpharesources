import { useRef, useState } from "react";
import { ImportCSV } from "../../../../../ui/ImportCSV/ImportCSV";
import { ImportCSVConfirmPreview } from "../../../../../ui/ImportCSV/ImportCSVConfirmPreview";
import { ImportCSVFileSelector } from "../../../../../ui/ImportCSV/ImportCSVFileSelector";
import useAuth from "../../../../../../hooks/useAuth";
import {useWbs} from "../WbsContext";
import { handleReq } from "../../../../../../functions/crud_s";

export const ImportContainer = ({ setHide }: { setHide: () => void }) => {
    const {areas, items, setIsLoading, areasNamesToIdsMap, itemsNamesToIdsMap, areasToItemsMap, refetchData} = useWbs();
    const { token, user } = useAuth();

    const tableHeaders = useRef(["Area", "Item"]);

    const uploadImport = async (lines) => {
        setIsLoading(true);

        const newAreas = new Set<string>();
        const newItems = new Map<string, string[]>();

        const existingAreasIds = [];
        const existingItemsIds = [];

        lines.forEach(l => {
            if(!areasNamesToIdsMap.has(l["Area"])){
                if(!newAreas.has(l["Area"])) {
                    newAreas.add(l["Area"])
                    newItems.set(l["Area"], []);
                };

                newItems.get(l["Area"]).push(l["Item"]);
                
            } else {
                existingAreasIds.push(areasNamesToIdsMap.get(l["Area"]))
                if(!areasToItemsMap.get(l["Area"]).find(i => i.name === l["Item"])){
                    if(!newItems.has(l["Area"])) newItems.set(l["Area"], []);
                    newItems.get(l["Area"]).push(l["Item"]);
                } else {
                    existingItemsIds.push(itemsNamesToIdsMap.get(l["Item"]));
                }
            }
        })

        const deleteAreasFunctionsArr = [];
        areas.forEach(a => {
            const area = existingAreasIds.find(i => i === a.id);
            if(!area) deleteAreasFunctionsArr.push(
                handleReq({
                    table: "wbs_area",
                    route: "delete",
                    token,
                    data: {id: a.id}
                })
            )
        });

        const deleteItemsFunctionsArr = [];
        items.forEach(item => {
            const _item = existingItemsIds.find(i => i === item.id);
            if(!_item) deleteItemsFunctionsArr.push(
                handleReq({
                    table: "wbs_item",
                    route: "delete",
                    token,
                    data: {id: item.id}
                })
            )
        });

        setHide();

        await Promise.all(deleteAreasFunctionsArr);
        await Promise.all(deleteItemsFunctionsArr);

        const newAreasNamesToIdsMap = new Map<string, number>(areasNamesToIdsMap);
        const submitAreasFunctionsArr = Array.from(newAreas).map(async (a) => {
            const res = await handleReq({
                table: "wbs_area",
                route: "createReturn",
                token,
                data: {
                    name: a,
                    user_id: user?.id,
                    color: "#FFFFFF"
                }
            });

            if (res?.data?.id) {
                newAreasNamesToIdsMap.set(a, res.data.id);
            }
        });

        await Promise.all(submitAreasFunctionsArr);

        const submitItemsFunctionsArr = [];
        Array.from(newItems).forEach(([area, items]) => {
            if(!newAreasNamesToIdsMap.has(area)) return;
            items.forEach(item => {
                submitItemsFunctionsArr.push(
                    handleReq({
                        table: "wbs_item",
                        route: 'create',
                        token,
                        data: {
                            area_id: newAreasNamesToIdsMap.get(area),
                            name: item,
                            user_id: user?.id
                        }
                    })
                )
            })
        })

        await Promise.all([...submitItemsFunctionsArr]);

        await refetchData();

        setIsLoading(false);
    }
    
    const areLinesValid = (lines) : [boolean, string] => {
        const analyzedLines = new Set();
        const analyzedItems = new Set();
        const repeatedLines = []
        const repeatedItems = [];

        for (const line in lines) {       
            const item = lines[line]["Item"];
            const areaAndItem = `${lines[line]["Area"]} - ${item}`;
            if(analyzedLines.has(areaAndItem)){
                repeatedLines.push(areaAndItem);
            } else {
                analyzedLines.add(areaAndItem);
            }
            if(analyzedItems.has(item) && !repeatedLines.includes(areaAndItem)){
                repeatedItems.push(areaAndItem);
            } else {
                analyzedItems.add(item);
            }
        }

        let error = "";
        if(repeatedLines.length !== 0){
            error += `Some lines are repeated (${repeatedLines.join(", ")}). `
        }
        if(repeatedLines.length !== 0){
            error += `Some items are repeated in multiple lines (${repeatedItems.join(", ")}).`
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
            <ImportCSVConfirmPreview />
        </ImportCSV>
    )
}