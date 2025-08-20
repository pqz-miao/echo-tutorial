import { Agent } from "@convex-dev/agent";
// import { createOpenAI } from "@ai-sdk/openai";

import { createDeepSeek } from "@ai-sdk/deepseek";
import { components } from "../../../_generated/api";

// const openai = createOpenAI({
//     apiKey: process.env.OPENAI_API_KEY,
//     baseURL: process.env.OPENAI_BASE_URL,
// });

const deepseek = createDeepSeek({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: process.env.DEEPSEEK_BASE_URL,
});

export const supportAgent = new Agent(components.agent, {
    // chat: openai("gpt-4o-mini"),
    chat: deepseek("deepseek-chat"),
    instructions: `You are a customer support agent. Use "resolveConversation" tool when user expresses finalization of the conversation. Use "escalateConversation" tool when user expresses frustration, or requests a human explicitly.`,
});
