"use client";

import { useQuery } from "convex/react";
import { useAtomValue, useSetAtom } from "jotai";
import { ArrowLeftIcon, MenuIcon } from "lucide-react";

import { api } from "@workspace/backend/_generated/api";
import { Button } from "@workspace/ui/components/button";

import { WidgetHeader } from "../components/widget-header";
import { 
    contactSessionIdAtomFamily,
    conversationIdAtom,
    organizationIdAtom,
    screenAtom,
} from "../../atoms/widget-atoms";

export const WidgetChatScreen = () => {
    const setScreen = useSetAtom(screenAtom);
    const setConversationId = useSetAtom(conversationIdAtom);
    
    const conversationId = useAtomValue(conversationIdAtom);
    const organizationId = useAtomValue(organizationIdAtom);
    const contactSessionId = useAtomValue(
        contactSessionIdAtomFamily(organizationId || "")
    );

    const conversation = useQuery(
        api.public.conversations.getOne,
        conversationId && contactSessionId ? {
            conversationId,
            contactSessionId,
        } : "skip"
    );

    const onBack = () => {
        setConversationId(null);
        setScreen("selection");
    };

    return (
        <>
            <WidgetHeader className="flex items-center justify-between">
                <div className="flex items-center gap-x-2">
                    <Button
                        size="icon"
                        variant="transparent"
                        onClick={onBack}
                    >
                        <ArrowLeftIcon />
                    </Button>
                    <p>Chat</p>
                </div>
                <Button
                    size="icon"
                    variant="transparent"
                >
                    <MenuIcon />
                </Button>
            </WidgetHeader>
            <div className="flex flex-1 flex-col gap-y-4 p-4">
                <p className="text-sm">
                    {JSON.stringify(conversation, null, 2)}
                </p>
            </div>
        </>
    );
};
