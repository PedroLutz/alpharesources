import GenericNavbar from "./GenericNavbar";

const PageWrapper = ({ children }) => {
    return (
        <div>
            <GenericNavbar
                base={{
                    titulo: 'Risk Management',
                    link: "/pags/risk/risks"
                }}
                itens={[
                    {
                        label: 'Audit',
                        link: "/pags/risk/audit"
                    }
                ]}
                dropdowns={[
                    {
                        titulo: 'Planning',
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
                        ]
                    }
                ]}

            />
            {children}
        </div>
    )
}

export default PageWrapper;