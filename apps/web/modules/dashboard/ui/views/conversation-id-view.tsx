"use client";

import { z } from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MoreHorizontalIcon, Wand2Icon } from "lucide-react";
import { useQuery, useMutation, useAction } from "convex/react";
import { toUIMessages, useThreadMessages } from "@convex-dev/agent/react";

import { cn } from "@workspace/ui/lib/utils";
import { api } from "@workspace/backend/_generated/api";
import { Button } from "@workspace/ui/components/button";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Form, FormField } from "@workspace/ui/components/form";
import { Doc, Id } from "@workspace/backend/_generated/dataModel";
import { AIResponse } from "@workspace/ui/components/ai/response";
import { DicebearAvatar } from "@workspace/ui/components/dicebear-avatar";
import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll";
import { InfiniteScrollTrigger } from "@workspace/ui/components/infinite-scroll-trigger";
import {
    AIConversation,
    AIConversationContent,
    AIConversationScrollButton
} from "@workspace/ui/components/ai/conversation";
import {
    AIInput,
    AIInputButton,
    AIInputSubmit,
    AIInputTextarea,
    AIInputToolbar,
    AIInputTools
} from "@workspace/ui/components/ai/input";
import {
    AIMessage,
    AIMessageContent
} from "@workspace/ui/components/ai/message";

import { ConversationStatusButton } from "../components/conversation-status-button";

interface Props {
    conversationId: Id<"conversations">;
};

const formSchema = z.object({
    message: z.string().min(1, "Message is required"),
});

export const ConversationIdView = ({ conversationId }: Props) => {
    const conversation = useQuery(api.private.conversations.getOne, {
        conversationId,
    });

    const messages = useThreadMessages(
        api.private.messages.getMany,
        conversation?.threadId ? { threadId: conversation.threadId } : "skip",
        { initialNumItems: 10 },
    );

    const { 
        topElementRef,
        handleLoadMore,
        canLoadMore,
        isLoadingMore
    } = useInfiniteScroll({
        status: messages.status,
        loadMore: messages.loadMore,
        loadSize: 10,
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            message: "",
        },
    });

    const [isEnhancing, setIsEnhancing] = useState(false);
    const createMessage = useMutation(api.private.messages.create);
    const enhanceResponse = useAction(api.private.messages.enhanceResponse);

    const handleEnhanceResponse = async () => {
        try {
            setIsEnhancing(true);

            const response = await enhanceResponse({
                prompt: form.getValues("message"),
            });

            form.setValue("message", response);
        } catch (error) {
            console.error(error);
        } finally {
            setIsEnhancing(false);
        }
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            await createMessage({
                conversationId,
                prompt: values.message,
            });

            form.reset();
        } catch (error) {
            console.error(error);
        }
    };

    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const updateConversationStatus = useMutation(api.private.conversations.updateStatus);
    const handleToggleStatus = async () => {
        if (!conversation) return;

        setIsUpdatingStatus(true);

        let newStatus: Doc<"conversations">["status"];

        // Cycle through states: unresolved -> escalated -> resolved -> unresolved
        if (conversation.status === "unresolved") {
            newStatus = "escalated";
        } else if (conversation.status === "escalated") {
            newStatus = "resolved";
        } else {
            newStatus = "unresolved";
        }

        try {
            await updateConversationStatus({
                conversationId,
                status: newStatus,
            });
        } catch (error) {
            console.error(error);
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    if (conversation === undefined || messages.status === "LoadingFirstPage") {
        return <ConversationIdViewSkeleton />;
    }

    return (
        <div className="flex h-full flex-col bg-muted">
            <header className="flex items-center justify-between border-b bg-background p-2">
                <Button
                    size="sm"
                    variant="ghost"
                >
                    <MoreHorizontalIcon />
                </Button>
                {!!conversation && (
                    <ConversationStatusButton
                        status={conversation.status}
                        onClick={handleToggleStatus}
                        disabled={isUpdatingStatus}
                    />
                )}
            </header>
            <AIConversation className="max-h-[calc(100vh-180px)]">
                <AIConversationContent>
                    <InfiniteScrollTrigger
                        canLoadMore={canLoadMore}
                        isLoadingMore={isLoadingMore}
                        onLoadMore={handleLoadMore}
                        ref={topElementRef}
                    />
                    {toUIMessages(messages.results ?? []).map((message) => (
                        <AIMessage
                            // In reverse, because we are watching from "assistant" to prespective
                            from={message.role === "user" ? "assistant" : "user"}
                            key={message.id}
                        >
                            <AIMessageContent>
                                <AIResponse>
                                    {message.content}
                                </AIResponse>
                            </AIMessageContent>
                            {message.role === "user" && (
                                <DicebearAvatar
                                    seed={conversation?.contactSessionId ?? "user"}
                                    size={32}
                                />
                            )}
                        </AIMessage>
                    ))}
                </AIConversationContent>
                <AIConversationScrollButton />
            </AIConversation>
            <div className="p-2">
                <Form {...form}>
                    <AIInput onSubmit={form.handleSubmit(onSubmit)}>
                        <FormField
                            control={form.control}
                            disabled={conversation?.status === "resolved"}
                            name="message"
                            render={({ field }) => (
                                <AIInputTextarea
                                    disabled={
                                        conversation?.status === "resolved" ||
                                        form.formState.isSubmitting ||
                                        isEnhancing
                                    }
                                    onChange={field.onChange}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            form.handleSubmit(onSubmit)();
                                        }
                                    }}
                                    placeholder={
                                        conversation?.status === "resolved"
                                            ? "Conversation resolved"
                                            : "Type your response as an operator..."
                                    }
                                    value={field.value}
                                />
                            )}
                        />
                        <AIInputToolbar>
                            <AIInputTools>
                                <AIInputButton
                                    onClick={handleEnhanceResponse}
                                    disabled={
                                        conversation?.status === "resolved" ||
                                        isEnhancing ||
                                        !form.formState.isValid
                                    }
                                >
                                    <Wand2Icon />
                                    {isEnhancing ? "Enhancing..." : "Enhance"}
                                </AIInputButton>
                            </AIInputTools>
                            <AIInputSubmit
                                disabled={
                                    conversation?.status === "resolved" ||
                                    !form.formState.isValid ||
                                    form.formState.isSubmitting ||
                                    isEnhancing
                                }
                                status="ready"
                                type="submit"
                            />
                        </AIInputToolbar>
                    </AIInput>
                </Form>
            </div>
        </div>
    );
};

export const ConversationIdViewSkeleton = () => {
    return (
        <div className="flex h-full flex-col bg-muted">
            <header className="flex items-center justify-between border-b bg-background p-2">
                <Button disabled size="sm" variant="ghost">
                    <MoreHorizontalIcon />
                </Button>
            </header>
            <AIConversation className="max-h-[calc(100vh-180px)]">
                <AIConversationContent>
                    {Array.from({ length: 8 }, (_, index) => {
                        const isUser = index % 2 === 0;
                        const widths = ["w-48", "w-60", "w-72"];
                        const width = widths[index % widths.length];

                        return (
                            <div
                                className={cn(
                                    "group flex w-full items-end justify-end gap-2 py-2 [&>div]:max-w-[80%]",
                                    isUser ? "is-user" : "is-assistant flex-row-reverse"
                                )}
                                key={index}
                            >
                                <Skeleton className={`h-9 ${width} rounded-lg bg-neutral-200`} />
                                <Skeleton className="size-8 rounded-full bg-neutral-200" />
                            </div>
                        )
                    })}
                </AIConversationContent>
            </AIConversation>
            <div className="p-2">
                <AIInput>
                    <AIInputTextarea
                        disabled
                        placeholder="Type your response as an operator..."
                    />
                    <AIInputToolbar>
                        <AIInputTools />
                        <AIInputSubmit disabled status="ready" />
                    </AIInputToolbar>
                </AIInput>
            </div>
        </div>
    );
};
