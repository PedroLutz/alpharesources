import GenericNavbar from "./GenericNavbar";

const PageWrapper = ({ children }) => {
    return (
        <div>
            <GenericNavbar
                base={{
                    titulo: 'Monitoring',
                    link: "/pags/report"
                }}
                dropdowns={[
                    {
                        titulo: 'Monitoring',
                        itens: [
                            {
                                label: 'Report Generator',
                                link: "/pags/report"
                            },
                            {
                                label: 'Change Log',
                                link: "/pags/monitoring/changelog"
                            },
                            {
                                label: 'Lessons learned',
                                link: "/pags/monitoring/lessons"
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