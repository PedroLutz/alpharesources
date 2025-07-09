import GenericNavbar from "./GenericNavbar";

const PageWrapper = ({ children }) => {
    return (
        <div>
            <GenericNavbar
                base={{
                    titulo: 'Monitoring',
                    link: "/pags/report"
                }}
                itens={[
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
                ]}
            />
            {children}
        </div>
    )
}

export default PageWrapper;