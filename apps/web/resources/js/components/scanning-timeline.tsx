import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

export default function ScanningTimeline() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    Scan Timeline
                </CardTitle>
                <CardDescription>Important events in this scan's lifecycle.</CardDescription>
            </CardHeader>
            <CardContent>
                content
            </CardContent>
        </Card>
    );
}
