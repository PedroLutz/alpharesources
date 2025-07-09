import GenericNavbar from "./GenericNavbar";

const PageWrapper = ({ children }) => {
    return (
        <div>
            <GenericNavbar
                base={{
                    titulo: 'Responsibilities',
                    link: "/pags/responsibilities/raci"
                }}
                itens={[
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
                ]}
            />
            {children}
        </div>
    )
}

export default PageWrapper;