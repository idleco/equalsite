import { Button } from "@/components/ui/button";
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { ReactNode} from "react";
import { useState } from "react";

type ClusterShellProps = {
    children: ReactNode;
    title: ReactNode | string;
    description: ReactNode | string;
}

export function ClusterShell({
    title,
    description,
    children,
    ...props
}: ClusterShellProps) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <Card {...props}>
            <Collapsible
                open={isOpen}
                onOpenChange={setIsOpen}
            >
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                    <CardAction>
                        <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full">
                                {isOpen ? <ChevronDown /> : <ChevronRight />}
                            </Button>
                        </CollapsibleTrigger>
                    </CardAction>
                </CardHeader>
                <CollapsibleContent className="mt-4">
                    {children}
                </CollapsibleContent>
            </Collapsible>
        </Card>
    )
}
