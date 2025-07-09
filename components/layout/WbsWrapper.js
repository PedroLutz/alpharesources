import GenericNavbar from "./GenericNavbar";

const PageWrapper = ({ children }) => {
    return (
        <div>
            <GenericNavbar
                base={{
                    titulo: 'WBS',
                    link: "/pags/wbs/wbs"
                }}
                itens={[
                    {
                        label: 'WBS',
                        link: "/pags/wbs/wbs"
                    },
                    {
                        label: 'Dictionary',
                        link: "/pags/wbs/dictionary"
                    },
                ]}
            />
            {children}
        </div>
    )
}

export default PageWrapper;