import { ArrowRightIcon, ArrowUpIcon, CheckIcon } from "lucide-react";

import { Hint } from "@workspace/ui/components/hint";
import { Button } from "@workspace/ui/components/button";
import { Doc } from "@workspace/backend/_generated/dataModel";

interface Props {
    status: Doc<"conversations">["status"];
    onClick: () => void;
    disabled?: boolean;
};

export const ConversationStatusButton = ({ status, onClick, disabled }: Props) => {
    if (status === "resolved") {
        return (
            <Hint text="Mark as unresolved">
                <Button disabled={disabled} onClick={onClick} variant="tertiary">
                    <CheckIcon />
                    Resolved
                </Button>
            </Hint>
        );
    }

    if (status === "escalated") {
        return (
            <Hint text="Mark as resolved">
                <Button disabled={disabled} onClick={onClick} variant="warning">
                    <ArrowUpIcon />
                    Escalated
                </Button>
            </Hint>
        );
    }

    return (
        <Hint text="Mark as escalated">
            <Button disabled={disabled} onClick={onClick} variant="destructive">
                <ArrowRightIcon />
                Unresolved
            </Button>
        </Hint>
    );
};
