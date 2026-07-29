import GenericNavbar from "./GenericNavbar";

const PageWrapper = ({ children }) => {
    return (
        <>
            <GenericNavbar
                base={{
                    titulo: 'Time',
                    link: "/pags/timeline/gantt"
                }}
                dropdowns={[
                    {
                        titulo: 'Legacy Pages',
                        itens: [
                            {
                                label: 'Timeline',
                                link: "/pags/timeline/timeline_plan"
                            },
                            {
                                label: 'Monitoring',
                                link: "/pags/timeline/monitoring"
                            },
                            {
                                label: 'Comparative Chart',
                                link: "/pags/timeline/comparison"
                            },
                        ]
                    }
                ]}
                itens={[
                    {
                    label: "Gantt Chart",
                    link: "/pags/timeline/gantt"
                }
                ]}
            />
            {children}
        </>
    )
}

export default PageWrapper;