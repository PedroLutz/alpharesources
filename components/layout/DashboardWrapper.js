import GenericNavbar from "./GenericNavbar";

const PageWrapper = ({ children }) => {
    return (
        <div>
            <GenericNavbar
                base={{
                    titulo: 'Dashboard',
                    link: "/"
                }}
                itens={[
                    {
                        label: 'User Account',
                        link: "/user_settings"
                    }
                ]}
            />
            {children}
        </div>
    )
}

export default PageWrapper;