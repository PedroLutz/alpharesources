import GenericNavbar from "./GenericNavbar";

const PageWrapper = ({ children }) => {
    return (
        <div>
            <GenericNavbar
                base={{
                    titulo: 'Dashboard',
                    link: "/"
                }}
                dropdowns={[
                    {
                        titulo: 'Areas',
                        itens: [
                            {
                                label: 'WBS',
                                link: "/pags/wbs/wbs"
                            },
                            {
                                label: 'Time Management',
                                link: "/pags/timeline/monitoring"
                            },
                            {
                                label: 'Budget & Resource Management',
                                link: "/pags/finances/finances/table"
                            },
                            {
                                label: 'Roles & Responsibilities',
                                link: "/pags/responsibilities/raci"
                            },
                            {
                                label: 'Communication Management',
                                link: "/pags/communication/stakeholders"
                            },
                            {
                                label: 'Risk Management',
                                link: "/pags/risk/risks"
                            },
                            {
                                label: 'Monitoring',
                                link: "/pags/report"
                            },
                        ]
                    },
                ]}
            />
            {children}
        </div>
    )
}

export default PageWrapper;