import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@workspace/ui/components/resizable";

import { ConversationsPanel } from "../components/conversations-panel";

interface Props {
    children: React.ReactNode;
};

export const ConversationsLayout = ({ children }: Props) => {
    return (
        <ResizablePanelGroup className="h-full flex-1" direction="horizontal">
            <ResizablePanel defaultSize={30} maxSize={30} minSize={20}>
                <ConversationsPanel />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel className="h-full" defaultSize={70}>
                {children}
            </ResizablePanel>
        </ResizablePanelGroup>
    );
};
