import { v, ConvexError } from "convex/values";
import { MessageDoc } from "@convex-dev/agent";
import { paginationOptsValidator, PaginationResult } from "convex/server";

import { Doc } from "../_generated/dataModel";
import { query } from "../_generated/server";
import { supportAgent } from "../system/ai/agents/supportAgent";

export const getMany = query({
    args: {
        paginationOpts: paginationOptsValidator,
        status: v.optional(
            v.union(
                v.literal("unresolved"),
                v.literal("escalated"),
                v.literal("resolved"),
            ),
        ),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Unauthorized",
            });
        }

        const orgId = identity.orgId as string;

        if (!orgId) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Organization not found",
            });
        }

        let conversations: PaginationResult<Doc<"conversations">>;

        if (args.status) {
            conversations = await ctx.db
                .query("conversations")
                .withIndex("by_status_and_organization_id", (q) =>
                    q
                        .eq(
                            "status",
                            args.status as Doc<"conversations">["status"],
                        )
                        .eq("organizationId", orgId)
                )
                .order("desc")
                .paginate(args.paginationOpts);
        } else {
            conversations = await ctx.db
                .query("conversations")
                .withIndex("by_organization_id", (q) =>
                    q.eq("organizationId", orgId)
                )
                .order("desc")
                .paginate(args.paginationOpts);
        }

        const conversationsWithAdditionalData = await Promise.all(
            conversations.page.map(async (conversation) => {
                let lastMessage: MessageDoc | null = null;

                const contactSession = await ctx.db.get(conversation.contactSessionId);

                if (!contactSession) return null;

                const messages = await supportAgent.listMessages(ctx, {
                    threadId: conversation.threadId,
                    paginationOpts: { numItems: 1, cursor: null },
                });

                if (messages.page.length > 0) {
                    lastMessage = messages.page[0] ?? null;
                }

                return {
                    ...conversation,
                    contactSession,
                    lastMessage,
                };
            })
        );

        const validConversations = conversationsWithAdditionalData.filter(
            (conv): conv is NonNullable<typeof conv> => conv !== null,
        );
        
        return {
            ...conversations,
            page: validConversations,
        };
    },
});

export const getOne = query({
    args: {
        conversationId: v.id("conversations"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Unauthorized",
            });
        }

        const orgId = identity.orgId as string;

        if (!orgId) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Organization not found",
            });
        }

        const conversation = await ctx.db.get(args.conversationId);

        if (!conversation) {
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Conversation not found",
            });
        }

        if (conversation.organizationId !== orgId) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Invalid organization Id",
            });
        }

        const contactSession = await ctx.db.get(conversation.contactSessionId);

        if (!contactSession) {
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Contact session not found",
            });
        }

        return {
            ...conversation,
            contactSession,
        };
    },
});
