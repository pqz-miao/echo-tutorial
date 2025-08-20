import { Provider } from "jotai";
import { cookies } from "next/headers";

import { SidebarProvider } from "@workspace/ui/components/sidebar";
import { AuthGuard } from "@/modules/auth/ui/components/auth-guard";
import { OrganizationGuard } from "@/modules/auth/ui/components/organization-guard";

import { DashboardSidebar } from "../components/dashboard-sidebar";

export const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
    const cookieStore = await cookies();
    // Using SIDEBAR_COOKIE_NAME from sidebar component does not work due to  monorepo and SSR
    const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";
    
    return (
        <AuthGuard>
            <OrganizationGuard>
                <Provider>
                    <SidebarProvider defaultOpen={defaultOpen}>
                        <DashboardSidebar />
                        <main className="flex flex-1 flex-col">
                            {children}
                        </main>
                    </SidebarProvider>
                </Provider>
            </OrganizationGuard>
        </AuthGuard>
    );
};
