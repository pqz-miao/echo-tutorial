import { Button } from "./button.js";

import { cn } from "../lib/utils.js";

interface Props {
    canLoadMore: boolean;
    isLoadingMore: boolean;
    onLoadMore: () => void;
    loadMoreText?: string;
    noMoreText?: string;
    className?: string;
    ref?: React.Ref<HTMLDivElement>;
};

export const InfiniteScrollTrigger = ({
    canLoadMore,
    isLoadingMore,
    onLoadMore,
    loadMoreText = "Load more"  ,
    noMoreText = "No more items",
    className,
    ref,
}: Props) => {
    let text = loadMoreText;

    if (isLoadingMore) {
        text = "Loading...";
    } else if (!canLoadMore) {
        text = noMoreText;
    }

    return (
        <div className={cn("flex w-full justify-center py-2", className)} ref={ref}>
            <Button
                disabled={!canLoadMore || isLoadingMore}
                onClick={onLoadMore}
                size="sm"
                variant="ghost"
            >
                {text}
            </Button>
        </div>
    );
};
