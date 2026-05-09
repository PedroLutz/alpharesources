import GenericNavbar from "./GenericNavbar";

const PageWrapper = ({ children }) => {
    return (
        <>
            <GenericNavbar
                base={{
                    titulo: 'Time',
                    link: "/pags/timeline/monitoring"
                }}
                dropdowns={[
                    {
                        titulo: 'Time',
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
            />
            {children}
        </>
    )
}

export default PageWrapper;