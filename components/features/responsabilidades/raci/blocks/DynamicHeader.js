import { useMemo } from "react";
import { useRaci } from "../data/RaciContext";

const DynamicHeader = ({ verOpcoes }) => {
    const {nomesMembros} = useRaci();

    const [tableHeaders, tableNames] = useMemo(() => {
        const firstNames = new Set();
        const fullNames = [];
        const headers = [];

        nomesMembros.forEach((membro) => {
            const nomeCompleto = membro.name;
            const firstName = nomeCompleto.split(' ')[0];
            const lastName = nomeCompleto.split(' ')[1];

            if (firstNames.has(firstName)) {
                headers.push(`${firstName} ${lastName.charAt(0)}.`);
                fullNames.push(`${firstName} ${lastName}`);
                const index = fullNames.findIndex(x => x.includes(firstName));
                const otherLastName = fullNames[index].split(' ')[1];
                headers[index] = `${firstName} ${otherLastName.charAt(0)}.`;
            } else {
                firstNames.add(firstName);
                headers.push(firstName);
                lastName != undefined ? fullNames.push(`${firstName} ${lastName}`) : fullNames.push(`${firstName}`);
            };

        });
        return [headers, fullNames];
    }, [nomesMembros])

    return (
        <thead>
            <tr>
                <th>Area</th>
                <th>Item</th>
                {!verOpcoes ? (
                    <>
                        {tableHeaders.map((membro, index) => (
                            <th key={index} className='notLast' style={{ writingMode: "sideways-lr", fontSize: "0.7rem" }}>{membro}</th>
                        ))}
                    </>
                ) : (
                    <>
                        {[...tableNames].map((membro, index) => (
                            <th key={index}>{membro}</th>
                        ))}
                        <th style={{ width: '5rem' }}>Actions</th>
                    </>
                )}

            </tr>
        </thead>
    )
}

export default DynamicHeader;