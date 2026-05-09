import GenericNavbar from "./GenericNavbar";

const PageWrapper = ({ children }) => {
    return (
        <>
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
        </>
    )
}

export default PageWrapper;