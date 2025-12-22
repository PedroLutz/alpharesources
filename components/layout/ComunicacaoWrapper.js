import GenericNavbar from "./GenericNavbar";

const PageWrapper = ({ children }) => {
    return (
        <div>
            <GenericNavbar
                base={{
                    titulo: 'Communication',
                    link: "/pags/communication/stakeholders"
                }}
                dropdowns={[
                    {
                        titulo: 'Communication',
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
                                label: 'Stakeholder Engagement',
                                link: "/pags/communication/engagement"
                            },
                            {
                                label: 'Group Engagement',
                                link: "/pags/communication/engagementGroups"
                            },
                            {
                                label: 'Communicated Information',
                                link: "/pags/communication/information"
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