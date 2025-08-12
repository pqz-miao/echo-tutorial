import { cn } from "@workspace/ui/lib/utils";

interface Props {
    children: React.ReactNode;
    className?: string;
};

export const WidgetHeader = ({ children, className }: Props) => {
    return (
        <header className={cn(
            "bg-gradient-to-b from-primary to-[#0b63f3] p-4 text-primary-foreground",
            className
        )}>
            {children}
        </header>
    );
};
