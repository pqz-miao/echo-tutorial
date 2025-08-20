import { generateText } from "ai";
import { ConvexError, v } from "convex/values";
import { saveMessage } from "@convex-dev/agent";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { paginationOptsValidator } from "convex/server";

import { components } from "../_generated/api";
import { mutation, query, action } from "../_generated/server";
import { supportAgent } from "../system/ai/agents/supportAgent";

export const create = mutation({
    args: {
        prompt: v.string(),
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
        
        if (conversation.status === "resolved") {
            throw new ConvexError({
                code: "BAD_REQUEST",
                message: "Conversation is resolved",
            });
        }
        
        await saveMessage(ctx, components.agent, {
            threadId: conversation.threadId,
            // TODO: Check if "agentName" is needed or not
            agentName: identity.familyName,
            message: {
                role: "assistant",
                content: args.prompt,
            },
        });
    },
});

export const getMany = query({
    args: {
        threadId: v.string(),
        paginationOpts: paginationOptsValidator,
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

        const conversation = await ctx.db
            .query("conversations")
            .withIndex("by_thread_id", (q) => q.eq("threadId", args.threadId))
            .unique();

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
        
        const paginated = await supportAgent.listMessages(ctx, {
            threadId: args.threadId,
            paginationOpts: args.paginationOpts,
        });

        return paginated;
    },
});

export const enhanceResponse = action({
    args: {
        prompt: v.string(),
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

        const deepseek = createDeepSeek({
            apiKey: process.env.DEEPSEEK_API_KEY,
            baseURL: process.env.DEEPSEEK_BASE_URL,
        });

        const response = await generateText({
            model: deepseek("deepseek-chat"),
            messages: [
                {
                    role: "system",
                    content: "Enhance the operator's message to be more professional, clear, and helpful while maintaining their intent and key information.",
                },
                {
                    role: "user",
                    content: args.prompt,
                },
            ],
        });

        return response.text;
    },
});
