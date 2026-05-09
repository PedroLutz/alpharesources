import GenericNavbar from "./GenericNavbar";

const PageWrapper = ({ children }) => {
    return (
        <>
            <GenericNavbar
                base={{
                    titulo: 'Risks',
                    link: "/pags/risk/risks"
                }}
                dropdowns={[
                    {
                        titulo: 'Risk',
                        itens: [
                            {
                                label: 'Identification',
                                link: "/pags/risk/risks"
                            },
                            {
                                label: 'Analysis',
                                link: "/pags/risk/analysis"
                            },
                            {
                                label: 'Impact',
                                link: "/pags/risk/impact"
                            },
                            {
                                label: 'Response',
                                link: "/pags/risk/responses"
                            },
                            {
                                label: 'Audit',
                                link: "/pags/risk/audit"
                            }
                        ]
                    }
                ]}

            />
            {children}
        </>
    )
}

export default PageWrapper;