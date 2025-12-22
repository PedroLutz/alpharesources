import GenericNavbar from "./GenericNavbar";

const PageWrapper = ({ children }) => {
    return (
        <div>
            <GenericNavbar
                base={{
                    titulo: 'WBS',
                    link: "/pags/wbs/wbs"
                }}
                dropdowns={[
                    {
                        titulo: 'WBS',
                        itens: [
                            {
                                label: 'WBS',
                                link: "/pags/wbs/wbs"
                            },
                            {
                                label: 'WBS Dictionary',
                                link: "/pags/wbs/dictionary"
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