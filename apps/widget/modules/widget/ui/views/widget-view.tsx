"use client";

import { WidgetFooter } from "../components/widget-footer";
import { WidgetAuthScreen } from "../screens/widget-auth-screen";

interface Props {
    organizationId: string;
};

export const WidgetView = ({ organizationId }: Props) => {
    return (
        // TODO: Confirm whether the min-h-screen & min-w-screen are needed
        <main className="min-h-screen min-w-screen flex flex-col h-full w-full overflow-hidden rounded-xl border bg-muted">
            <WidgetAuthScreen />
            {/* <WidgetFooter /> */}
        </main>
    );
};
