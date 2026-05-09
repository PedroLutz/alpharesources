import GenericNavbar from "./GenericNavbar";

const PageWrapper = ({ children }) => {
    return (
        <>
            <GenericNavbar
                base={{
                    titulo: 'Responsibilities',
                    link: "/pags/responsibilities/raci"
                }}
                dropdowns={[
                    {
                        titulo: 'Roles & Responsibilities',
                        itens: [
                            {
                                label: 'RACI Matrix',
                                link: "/pags/responsibilities/raci"
                            },
                            {
                                label: 'Members',
                                link: "/pags/responsibilities/members"
                            },
                            {
                                label: 'Roles',
                                link: "/pags/responsibilities/roles"
                            },
                            {
                                label: 'Skills',
                                link: "/pags/responsibilities/skill_evaluation"
                            },
                        ]
                    },
                ]}
            />
            {children}
        </>
    )
}

export default PageWrapper;