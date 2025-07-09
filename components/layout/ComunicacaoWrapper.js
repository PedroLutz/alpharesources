import GenericNavbar from "./GenericNavbar";

const PageWrapper = ({ children }) => {
    return (
        <div>
            <GenericNavbar
                base={{
                    titulo: 'Communication',
                    link: "/pags/communication/stakeholders"
                }}
                itens={[
                    {
                        label: 'Communicated Information',
                        link: "/pags/communication/information"
                    }
                ]}
                dropdowns={[
                    {
                        titulo: 'Stakeholders',
                        itens: [
                            {
                                label: 'Groups',
                                link: "/pags/communication/stakeholderGroups"
                            },
                            {
                                label: 'Identification',
                                link: "/pags/communication/stakeholders"
                            },
                            {
                                label: 'Engagement',
                                link: "/pags/communication/engagement"
                            }
                        ]
                    }

                ]}
            />
            {children}
        </div>
    )
}

export default PageWrapper;