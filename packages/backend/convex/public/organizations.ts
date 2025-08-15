import { v } from "convex/values";
import { createClerkClient } from "@clerk/backend";

import { action } from "../_generated/server";

const clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
});

export const validate = action({
    args: {
        organizationId: v.string(),
    },
    handler: async (_, args) => {
        try {
            await clerkClient.organizations.getOrganization({
                organizationId: args.organizationId,
            });

            return { valid: true };
        } catch {
            return { valid: false, reason: "Organization not valid" };
        }
    },
});
