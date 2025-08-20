import { ConvexError, v } from "convex/values";
import { saveMessage } from "@convex-dev/agent";
import { paginationOptsValidator } from "convex/server";

import { action, query } from "../_generated/server";
import { internal, components } from "../_generated/api";
import { supportAgent } from "../system/ai/agents/supportAgent";
import { resolveConversation } from "../system/ai/tools/resolveConversation";
import { escalateConversation } from "../system/ai/tools/escalateConversation";

export const create = action({
    args: {
        prompt: v.string(),
        threadId: v.string(),
        contactSessionId: v.id("contactSessions"),
    },
    handler: async (ctx, args) => {
        const contactSession = await ctx.runQuery(
            internal.system.contactSessions.getOne,
            {
                contactSessionId: args.contactSessionId,
            },
        );

        if (!contactSession || contactSession.expiresAt < Date.now()) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Invalid contact session",
            });
        }

        const conversation = await ctx.runQuery(
            internal.system.conversations.getByThreadId,
            {
                threadId: args.threadId,
            },
        );
        
        if (!conversation) {
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Conversation not found",
            });
        }
        
        if (conversation.status === "resolved") {
            throw new ConvexError({
                code: "BAD_REQUEST",
                message: "Conversation is resolved",
            });
        }
        
        // TODO: Implement subscription check

        const shouldTriggerAgent = 
            conversation.status === "unresolved";

        if (shouldTriggerAgent) {
            await supportAgent.generateText(
                ctx,
                { threadId: args.threadId },
                {
                    prompt: args.prompt,
                    tools: {
                        resolveConversation,
                        escalateConversation,
                    },
                },
            );
        } else {
            // await supportAgent.saveMessage(ctx, {
            await saveMessage(ctx, components.agent, {
                threadId: args.threadId,
                prompt: args.prompt,
            });
        }
    },
});

export const getMany = query({
    args: {
        threadId: v.string(),
        paginationOpts: paginationOptsValidator,
        contactSessionId: v.id("contactSessions"),
    },
    handler: async (ctx, args) => {
        const contactSession = await ctx.db.get(args.contactSessionId);

        if (!contactSession || contactSession.expiresAt < Date.now()) {
            throw new ConvexError({
                code: "UNAUTHORIZED",
                message: "Invalid contact session",
            });
        }
        
        const paginated = await supportAgent.listMessages(ctx, {
            threadId: args.threadId,
            paginationOpts: args.paginationOpts,
        });

        return paginated;
    },
});
