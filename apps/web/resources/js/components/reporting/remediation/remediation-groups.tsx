import { Stack } from "@/components/stack";
import { GroupShell } from "./group-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CodeBlock } from "@/components/code-block";

type Group = {
    ruleId: string;
    totalAffectedUrls: number;
    totalUniqueInstances: number;
}

const fakeGroups: Group[] = [
    {
        ruleId: 'button name',
        totalAffectedUrls: 33,
        totalUniqueInstances: 4
    },
    {
        ruleId: 'color contrast',
        totalAffectedUrls: 33,
        totalUniqueInstances: 4
    }
];

export function RemediationGroups() {
    return (
        <Stack gap="md">
            {fakeGroups.map((i) => (
                <GroupShell
                    key={i.ruleId}
                    title={i.ruleId}
                    description={`${i.totalAffectedUrls} pages affected &middot; ${i.totalUniqueInstances} unique instances`}
                >
                    <div className="space-y-4">
                        <Card>
                            <CardContent>
                                Lorem ipsum dolor sit amet consectetur adipisicing elit. Debitis laudantium placeat praesentium, veritatis dignissimos porro maiores sit, beatae tempora ducimus enim eveniet ratione asperiores perferendis soluta error rem quidem repellendus.
                            </CardContent>
                        </Card>
                        <div className="grid grid-cols-2 gap-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Where To Start</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="border">
                                        .asdasd
                                    </div>
                                </CardContent>
                            </Card>
                            <CodeBlock
                                code="test"
                            />
                        </div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Affected URL(s)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                asdsa
                            </CardContent>
                        </Card>
                    </div>
                </GroupShell>
            ))}
        </Stack>
    )
}
