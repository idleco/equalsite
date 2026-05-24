import { Clock } from "lucide-react";
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item";
import { useEffect, useState } from "react";

type Props = {
    createdAt: string;
    startedAt?: string;
};

function formatElapsed(ms: number) {
    const totalSeconds = Math.floor(ms / 1000);

  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');

  return `${hours}:${minutes}:${seconds}`;
}

export default function TimeElapsed({
    createdAt,
    startedAt
}: Props) {
    const since = new Date(createdAt).getTime();
    const until = startedAt ? new Date(startedAt).getTime() : Date.now();
    const [elapsed, setElapsed] = useState(until - since);
    useEffect(() => {
        if (startedAt) {
            return;
        }
        const interval = setInterval(() => {
            setElapsed(until - since);
        }, 1000);
        return () => {
            clearInterval(interval);
        }
    }, [since, until, startedAt]);
    return (
        <Item variant="outline">
            <ItemMedia variant="icon">
                <Clock className="size-4" />
            </ItemMedia>
            <ItemContent>
                <ItemTitle>Time Elapsed</ItemTitle>
                <ItemDescription>{formatElapsed(elapsed)}</ItemDescription>
            </ItemContent>
        </Item>
    )
}
