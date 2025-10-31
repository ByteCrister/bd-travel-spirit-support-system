// components/company/CompanyAccordionSkeleton.tsx
"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function CompanyAccordionSkeleton() {
    return (
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="overview">
                <AccordionTrigger>Company information</AccordionTrigger>
                <AccordionContent>
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardContent className="p-4 space-y-3">
                                <Row />
                                <Row />
                                <Row />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="grid grid-cols-2 gap-3">
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <div key={i} className="rounded-lg border p-3 space-y-2">
                                            <Skeleton className="h-3 w-24" />
                                            <Skeleton className="h-6 w-20" />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}

function Row() {
    return (
        <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-4 w-40" />
        </div>
    );
}
