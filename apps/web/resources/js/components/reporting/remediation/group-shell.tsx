import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { ReactNode} from "react";
import { useState } from "react";

type GroupShellProps = {
    children: ReactNode;
    title: string;
    description: string;
}

export function GroupShell({
    title,
    description,
    children
}: GroupShellProps) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <Card>
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
                    <CardContent>
                        {children}
                    </CardContent>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    )
}
