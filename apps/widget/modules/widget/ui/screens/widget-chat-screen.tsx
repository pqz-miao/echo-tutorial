"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { useAtomValue, useSetAtom } from "jotai";
import { useQuery, useAction } from "convex/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon, MenuIcon } from "lucide-react";
import { useThreadMessages, toUIMessages } from "@convex-dev/agent/react";

import { api } from "@workspace/backend/_generated/api";
import { Button } from "@workspace/ui/components/button";
import { Form, FormField } from "@workspace/ui/components/form";
import { AIResponse } from "@workspace/ui/components/ai/response";
import {
    AIConversation,
    AIConversationContent,
    AIConversationScrollButton
} from "@workspace/ui/components/ai/conversation";
import {
    AIInput,
    AIInputSubmit,
    AIInputTextarea,
    AIInputToolbar,
    AIInputTools
} from "@workspace/ui/components/ai/input";
import {
    AIMessage,
    AIMessageContent
} from "@workspace/ui/components/ai/message";
import {
    AISuggestion,
    AISuggestions
} from "@workspace/ui/components/ai/suggestion";

import { WidgetHeader } from "../components/widget-header";
import { 
    contactSessionIdAtomFamily,
    conversationIdAtom,
    organizationIdAtom,
    screenAtom,
} from "../../atoms/widget-atoms";

const formSchema = z.object({
    message: z.string().min(1, "Message is required"),
});

export const WidgetChatScreen = () => {
    const setScreen = useSetAtom(screenAtom);
    const setConversationId = useSetAtom(conversationIdAtom);
    
    const conversationId = useAtomValue(conversationIdAtom);
    const organizationId = useAtomValue(organizationIdAtom);
    const contactSessionId = useAtomValue(
        contactSessionIdAtomFamily(organizationId || "")
    );

    const onBack = () => {
        setConversationId(null);
        setScreen("selection");
    };

    const conversation = useQuery(
        api.public.conversations.getOne,
        conversationId && contactSessionId ? {
            conversationId,
            contactSessionId,
        } : "skip"
    );

    const messages = useThreadMessages(
        api.public.messages.getMany,
        conversation?.threadId && contactSessionId
            ? {
                threadId: conversation.threadId,
                contactSessionId,
              }
            : "skip",
        { initialNumItems: 10 },
    );

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            message: "",
        },
    });
    const createMessage = useAction(api.public.messages.create);
    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (!conversation || !contactSessionId) return;

        form.reset();

        await createMessage({
            threadId: conversation.threadId,
            prompt: values.message,
            contactSessionId,
        });
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
            <AIConversation>
                <AIConversationContent>
                    {toUIMessages(messages.results ?? []).map((message) => (
                        <AIMessage
                            from={message.role === "user" ? "user" : "assistant"}
                            key={message.id}
                        >
                            <AIMessageContent>
                                <AIResponse>
                                    {message.content}
                                </AIResponse>
                            </AIMessageContent>
                            {/* TODO: Add Avatar component */}
                        </AIMessage>
                    ))}
                </AIConversationContent>
            </AIConversation>
            {/* TODO: Add suggestions */}
            <Form {...form}>
                <AIInput
                    className="rounded-none border-x-0 border-b-0"
                    onSubmit={form.handleSubmit(onSubmit)}
                >
                    <FormField
                        control={form.control}
                        disabled={conversation?.status === "resolved"}
                        name="message"
                        render={({ field }) => (
                            <AIInputTextarea
                                disabled={conversation?.status === "resolved"}
                                onChange={field.onChange}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        form.handleSubmit(onSubmit)();
                                    }
                                }}
                                placeholder={
                                    conversation?.status === "resolved"
                                        ? "This conversation has been resolved."
                                        : "Type a message..."
                                }
                                value={field.value}
                            />
                        )}
                    />
                    <AIInputToolbar>
                        <AIInputTools />
                        <AIInputSubmit
                            disabled={conversation?.status === "resolved" || !form.formState.isValid}
                            status="ready"
                            type="submit"
                        />
                    </AIInputToolbar>
                </AIInput>
            </Form>
        </>
    );
};
