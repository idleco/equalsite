import type { ScanQueue } from "@/types";
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item';
import { Layers } from "lucide-react";

type QueuePositionProps = {
    scanQueue: ScanQueue
}

export function QueuePosition({ scanQueue }: QueuePositionProps) {
    return (
        <Item variant="outline">
            <ItemMedia variant="icon">
                <Layers className="size-4" />
            </ItemMedia>
            <ItemContent>
                <ItemTitle>Your place in queue</ItemTitle>
                {scanQueue.position > 0 ? (
                    <ItemTitle className="text-2xl">
                        {scanQueue.position} / {scanQueue.waiting}
                    </ItemTitle>
                ) : (
                    <ItemTitle className="text-2xl">
                        Next
                    </ItemTitle>
                )}
                <ItemDescription>Jobs ahead of you: {scanQueue.ahead}</ItemDescription>
            </ItemContent>
        </Item>
    )
}
