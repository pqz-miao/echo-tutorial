import { ArrowRightIcon, ArrowUpIcon, CheckIcon } from "lucide-react";

import { cn } from "@workspace/ui/lib/utils";

interface Props {
    status: "unresolved" | "resolved" | "escalated";
    className?: string;
};

const statusConfig = {
    resolved: {
        icon: CheckIcon,
        bgColor: "bg-[#3FB62F]",
    },
    unresolved: {
        icon: ArrowRightIcon,
        bgColor: "bg-destructive",
    },
    escalated: {
        icon: ArrowUpIcon,
        bgColor: "bg-yellow-500",
    },
} as const;

export const ConversationStatusIcon = ({ status, className }: Props) => {
    const { icon: Icon, bgColor } = statusConfig[status];

    return (
        <div className={cn(
            "flex items-center justify-center rounded-full size-5",
            bgColor,
            className,
        )}>
            <Icon className="size-3 stroke-3 text-white" />
        </div>
    );
};
