import GenericNavbar from "./GenericNavbar";

const PageWrapper = ({ children }) => {
    return (
        <div>
            <GenericNavbar
                base={{
                    titulo: 'Time Management',
                    link: "/pags/timeline/monitoring"
                }}
                itens={[
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
                ]}
            />
            {children}
        </div>
    )
}

export default PageWrapper;