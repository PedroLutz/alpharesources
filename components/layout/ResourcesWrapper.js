import GenericNavbar from "./GenericNavbar";

const PageWrapper = ({ children }) => {
    return (
        <>
            <GenericNavbar
                base={{
                    titulo: 'Budget & Resource',
                    link: "/pags/finances/finances/table"
                }}
                dropdowns={[
                    {
                        titulo: 'Monitoring',
                        itens: [
                            {
                                label: 'Cash flow',
                                link: "/pags/finances/finances/table"
                            },
                            {
                                label: 'Cost-Benefit Analysis',
                                link: "/pags/finances/costBenefit/table"
                            },
                            {
                                label: 'Report',
                                link: "/pags/finances/finances/report"
                            }
                        ]
                    },
                    {
                        titulo: 'Cost & Resources',
                        itens: [
                            {
                                label: 'Resource Identification',
                                link: "/pags/resources/identification"
                            },
                            {
                                label: 'Resource Acquisition',
                                link: "/pags/resources/acquisition_planning"
                            },
                            {
                                label: 'Cost Breakdown Structure (CBS)',
                                link: "/pags/resources/cbs"
                            }
                        ]
                    },
                ]}
            />
            {children}
        </>
    )
}

export default PageWrapper;