'use client';

import React, { useEffect, useState } from "react";
import { useCompanyDetailStore } from "@/store/company-detail.store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
    ChevronLeft,
    ChevronRight,
    AlertCircle,
    Flag,
    UserCircle,
    Calendar,
    FileText,
    MessageSquare,
    Clock,
    AlertTriangle,
    Paperclip,
    ChevronsLeft,
    ChevronsRight,
    TrendingUp,
    CheckCircle2,
    XCircle,
    Eye,
} from "lucide-react";
import { REPORT_PRIORITY, REPORT_REASON, REPORT_STATUS } from "@/constants/report.const";
import { format } from "date-fns";

type Props = {
    companyId: string;
    tourId: string;
    tourTitle?: string;
};

function getInitials(name?: string) {
    if (!name) return "?";
    return name.split(" ").map((n) => n?.[0] ?? "").join("").toUpperCase().slice(0, 2);
}

export default function ReportsPanel({ companyId, tourId, tourTitle }: Props) {
    const { fetchReports, listCache, loading, error, params } = useCompanyDetailStore();

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const loadingKey = `reportsList:${tourId}`;
    const errorKey = `reportsListError:${tourId}`;
    const isLoading = Boolean(loading?.[loadingKey]);
    const errorMessage = error?.[errorKey];

    const currentParams = params?.tourReports?.[tourId];
    const activeCacheKey = `${currentPage}-${pageSize}-${currentParams?.sort || ""}-${currentParams?.order || ""}`;
    const cachedData = listCache?.tourReports?.[tourId]?.[activeCacheKey];

    useEffect(() => {
        if (!companyId || !tourId) return;
        const key = `${currentPage}-${pageSize}`;
        if (!listCache?.tourReports?.[tourId]?.[key]) {
            void fetchReports(companyId, tourId, { page: currentPage, limit: pageSize });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [companyId, tourId, currentPage, pageSize]);

    useEffect(() => {
        if (cachedData && currentPage > cachedData.pages) {
            setCurrentPage(cachedData.pages || 1);
        }
    }, [cachedData, currentPage]);

    const handlePageChange = (newPage: number) => {
        if (cachedData?.pages) {
            const safePage = Math.max(1, Math.min(newPage, cachedData.pages));
            setCurrentPage(safePage);
            return;
        }
        setCurrentPage(Math.max(1, newPage));
    };

    const handlePageSizeChange = (newSize: string) => {
        const size = Number(newSize) || 10;
        setPageSize(size);
        setCurrentPage(1);
    };

    const startItem = cachedData ? (cachedData.page - 1) * pageSize + 1 : 0;
    const endItem = cachedData ? Math.min(cachedData.page * pageSize, cachedData.total) : 0;

    const getStatusBadgeVariant = (status: REPORT_STATUS) => {
        switch (status) {
            case REPORT_STATUS.OPEN:
                return "default";
            case REPORT_STATUS.IN_REVIEW:
                return "secondary";
            case REPORT_STATUS.RESOLVED:
                return "outline";
            case REPORT_STATUS.REJECTED:
                return "destructive";
            default:
                return "default";
        }
    };

    const getStatusIcon = (status: REPORT_STATUS) => {
        switch (status) {
            case REPORT_STATUS.OPEN:
                return <AlertCircle className="h-3.5 w-3.5" />;
            case REPORT_STATUS.IN_REVIEW:
                return <Eye className="h-3.5 w-3.5" />;
            case REPORT_STATUS.RESOLVED:
                return <CheckCircle2 className="h-3.5 w-3.5" />;
            case REPORT_STATUS.REJECTED:
                return <XCircle className="h-3.5 w-3.5" />;
            default:
                return null;
        }
    };

    const getPriorityBadgeVariant = (priority: REPORT_PRIORITY) => {
        switch (priority) {
            case REPORT_PRIORITY.HIGH:
                return "destructive";
            case REPORT_PRIORITY.NORMAL:
                return "default";
            case REPORT_PRIORITY.URGENT:
                return "secondary";
            default:
                return "default";
        }
    };

    const formatReportReason = (reason: REPORT_REASON | string) => {
        if (!reason) return "";
        return String(reason).replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
    };

    return (
        <div className="bg-white border border-slate-100 rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 pt-5 pb-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
                        <Flag className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="font-bold text-lg truncate">Reports for {tourTitle || "Tour"}</div>
                        <div className="text-xs mt-1">View and manage all reports submitted for this tour</div>
                    </div>
                </div>
            </div>

            <div className="flex-1 min-h-0 flex flex-col px-6 pb-4">
                {errorMessage && (
                    <Alert variant="destructive" className="mt-3 mb-2 shrink-0">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-sm">{errorMessage}</AlertDescription>
                    </Alert>
                )}

                {cachedData && (
                    <div className="grid grid-cols-4 gap-3 py-3">
                        <Card className="border-l-4 border-l-blue-500">
                            <CardHeader className="pb-2 pt-2.5 px-3">
                                <CardDescription className="text-xs font-medium">Total</CardDescription>
                                <CardTitle className="text-xl font-bold">{cachedData.total ?? 0}</CardTitle>
                            </CardHeader>
                        </Card>

                        <Card className="border-l-4 border-l-green-500">
                            <CardHeader className="pb-2 pt-2.5 px-3">
                                <CardDescription className="text-xs font-medium">Showing</CardDescription>
                                <CardTitle className="text-xl font-bold">{startItem}-{endItem}</CardTitle>
                            </CardHeader>
                        </Card>

                        <Card className="border-l-4 border-l-purple-500">
                            <CardHeader className="pb-2 pt-2.5 px-3">
                                <CardDescription className="text-xs font-medium">Page</CardDescription>
                                <CardTitle className="text-xl font-bold">{cachedData.page ?? 1}</CardTitle>
                            </CardHeader>
                        </Card>

                        <Card className="border-l-4 border-l-orange-500">
                            <CardHeader className="pb-2 pt-2.5 px-3">
                                <CardDescription className="text-xs font-medium">Pages</CardDescription>
                                <CardTitle className="text-xl font-bold">{cachedData.pages ?? 1}</CardTitle>
                            </CardHeader>
                        </Card>
                    </div>
                )}

                <div className="flex-1 min-h-0">
                    <ScrollArea className="h-full">
                        <div className="space-y-3 pr-4 pb-4">
                            {isLoading ? (
                                Array.from({ length: pageSize }).map((_, idx) => (
                                    <Card key={idx}>
                                        <CardContent className="p-4">
                                            <div className="space-y-3">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <Skeleton className="h-12 w-12 rounded-full" />
                                                        <div className="space-y-2">
                                                            <Skeleton className="h-4 w-32" />
                                                            <Skeleton className="h-3 w-24" />
                                                        </div>
                                                    </div>
                                                    <Skeleton className="h-6 w-20" />
                                                </div>
                                                <Skeleton className="h-16 w-full" />
                                                <div className="flex gap-2">
                                                    <Skeleton className="h-6 w-20" />
                                                    <Skeleton className="h-6 w-24" />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            ) : cachedData && cachedData.items && cachedData.items.length > 0 ? (
                                cachedData.items.map((report) => (
                                    <Card
                                        key={report.id}
                                        className="hover:shadow-md transition-shadow border-l-4"
                                        style={{
                                            borderLeftColor:
                                                report.priority === REPORT_PRIORITY.HIGH ? "#ef4444" :
                                                    report.priority === REPORT_PRIORITY.URGENT ? "#f59e0b" : "#6b7280",
                                        }}
                                    >
                                        <CardContent className="p-4">
                                            <div className="space-y-3">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                        <Avatar className="h-12 w-12 border-2 border-primary/10 shrink-0">
                                                            {report?.reporterAvatarUrl ? (
                                                                <AvatarImage src={report.reporterAvatarUrl} />
                                                            ) : (
                                                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                                                                    {getInitials(report.reporterName)}
                                                                </AvatarFallback>
                                                            )}
                                                        </Avatar>

                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-semibold truncate">{report.reporterName || "Anonymous User"}</div>
                                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                                                                <Calendar className="h-3 w-3 shrink-0" />
                                                                <span className="truncate">
                                                                    {report.createdAt ? format(new Date(report.createdAt), "MMM dd, yyyy 'at' HH:mm") : "—"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <Badge variant={getStatusBadgeVariant(report.status)} className="gap-1.5 shrink-0">
                                                        {getStatusIcon(report.status)}
                                                        <span className="text-xs font-medium">{report.status}</span>
                                                    </Badge>
                                                </div>

                                                <Separator />

                                                <div className="flex items-center gap-2 bg-orange-50 px-3 py-2 rounded-lg">
                                                    <AlertTriangle className="h-4 w-4 text-orange-600 shrink-0" />
                                                    <span className="text-sm font-semibold text-orange-900">{formatReportReason(report.reason)}</span>
                                                </div>

                                                {report.messageExcerpt && (
                                                    <div className="bg-muted/50 rounded-lg p-3 border">
                                                        <div className="flex gap-2">
                                                            <MessageSquare className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                                            <p className="text-sm leading-relaxed break-words">{report.messageExcerpt}</p>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex flex-wrap items-center gap-2">
                                                    <Badge variant={getPriorityBadgeVariant(report.priority)} className="gap-1">
                                                        <Flag className="h-3 w-3" />
                                                        <span className="text-xs">{report.priority}</span>
                                                    </Badge>

                                                    {report.assignedToName ? (
                                                        <div className="flex items-center gap-1.5 text-xs bg-secondary px-2 py-1 rounded-md">
                                                            <UserCircle className="h-3 w-3 shrink-0" />
                                                            <span className="truncate">{report.assignedToName}</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                                                            <UserCircle className="h-3 w-3" />
                                                            <span>Unassigned</span>
                                                        </div>
                                                    )}

                                                    {report.evidenceCount && report.evidenceCount > 0 && (
                                                        <div className="flex items-center gap-1.5 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md">
                                                            <Paperclip className="h-3 w-3 shrink-0" />
                                                            <span>{report.evidenceCount} file{report.evidenceCount > 1 ? 's' : ''}</span>
                                                        </div>
                                                    )}

                                                    {report.reopenedCount > 0 && (
                                                        <Badge variant="outline" className="gap-1 text-xs">
                                                            <TrendingUp className="h-3 w-3" />
                                                            <span>Reopened {report.reopenedCount}x</span>
                                                        </Badge>
                                                    )}
                                                </div>

                                                {report.flags && report.flags.length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {report.flags.map((flag: string) => (
                                                            <Badge key={flag} variant="secondary" className="text-xs">{flag}</Badge>
                                                        ))}
                                                    </div>
                                                )}

                                                {report.lastActivityAt && (
                                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-2 border-t">
                                                        <Clock className="h-3 w-3 shrink-0" />
                                                        <span>Updated: {format(new Date(report.lastActivityAt), "MMM dd, HH:mm")}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <Card>
                                    <CardContent className="py-12">
                                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                                            <FileText className="h-10 w-10" />
                                            <div className="text-center">
                                                <p className="font-semibold">No reports found</p>
                                                <p className="text-sm">This tour has no reports</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </div>

            {cachedData && cachedData.items && cachedData.items.length > 0 && (
                <div className="px-6 py-2.5 border-t bg-muted/20">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-muted-foreground">Show:</span>
                                <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
                                    <SelectTrigger className="w-[75px] h-7 text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="5">5</SelectItem>
                                        <SelectItem value="10">10</SelectItem>
                                        <SelectItem value="20">20</SelectItem>
                                        <SelectItem value="50">50</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Separator orientation="vertical" className="h-4" />

                            <div className="text-xs font-medium">
                                <span className="text-primary font-semibold">{startItem}-{endItem}</span> of <span className="text-primary font-semibold">{cachedData.total}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-1">
                            <Button variant="outline" size="sm" onClick={() => handlePageChange(1)} disabled={cachedData.page === 1 || isLoading} className="h-7 w-7 p-0">
                                <ChevronsLeft className="h-3.5 w-3.5" />
                            </Button>

                            <Button variant="outline" size="sm" onClick={() => handlePageChange((cachedData.page || 1) - 1)} disabled={cachedData.page === 1 || isLoading} className="h-7 px-2 text-xs">
                                <ChevronLeft className="h-3.5 w-3.5" />
                            </Button>

                            <div className="px-3 py-1 bg-primary text-primary-foreground rounded text-xs font-semibold min-w-[80px] text-center">
                                {cachedData.page}/{cachedData.pages}
                            </div>

                            <Button variant="outline" size="sm" onClick={() => handlePageChange((cachedData.page || 1) + 1)} disabled={cachedData.page === cachedData.pages || isLoading} className="h-7 px-2 text-xs">
                                <ChevronRight className="h-3.5 w-3.5" />
                            </Button>

                            <Button variant="outline" size="sm" onClick={() => handlePageChange(cachedData.pages)} disabled={cachedData.page === cachedData.pages || isLoading} className="h-7 w-7 p-0">
                                <ChevronsRight className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
