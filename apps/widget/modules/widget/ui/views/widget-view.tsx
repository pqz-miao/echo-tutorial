"use client";

import { useAtomValue } from "jotai";

import { screenAtom } from "../../atoms/widget-atoms";
import { WidgetAuthScreen } from "../screens/widget-auth-screen";

interface Props {
    organizationId: string;
};

export const WidgetView = ({ organizationId }: Props) => {
    const screen = useAtomValue(screenAtom);

    const screenComponents = {
        error: <p>TODO: Error screen</p>,
        loading: <p>TODO: Loading screen</p>,
        auth: <WidgetAuthScreen />,
        voice: <p>TODO: Voice screen</p>,
        inbox: <p>TODO: Inbox screen</p>,
        selection: <p>TODO: Selection screen</p>,
        chat: <p>TODO: Chat screen</p>,
        contact: <p>TODO: Contact screen</p>,
    };

    return (
        // TODO: Confirm whether the min-h-screen & min-w-screen are needed
        <main className="min-h-screen min-w-screen flex flex-col h-full w-full overflow-hidden rounded-xl border bg-muted">
            {screenComponents[screen]}
        </main>
    );
};
