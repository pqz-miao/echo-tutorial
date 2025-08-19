import { ConversationsLayout } from "@/modules/dashboard/ui/layouts/conversations-layout";

interface Props {
    children: React.ReactNode;
};

const Layout = ({ children }: Props) => {
    return (
        <ConversationsLayout>
            {children}
        </ConversationsLayout>
    );
};

export default Layout;
