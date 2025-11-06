// components/users/UserProfileDrawer.tsx
"use client";

import { motion } from "framer-motion";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User } from "@/types/user.types";
import { UserActivityTab } from "./UserActivityTab";
import { UserRolesTab } from "./UserRolesTab";
import { UserSecurityTab } from "./UserSecurityTab";
import { UserNotificationsTab } from "./UserNotificationsTab";
import { UserAuditTab } from "./UserAuditTab";


interface UserProfileDrawerProps {
    user: User | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function UserProfileDrawer({ user, open, onOpenChange }: UserProfileDrawerProps) {
    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent className="max-w-4xl mx-auto rounded-t-2xl max-h-[90vh]">
                  <DrawerTitle className="sr-only">User Profile</DrawerTitle>
                <div className="overflow-hidden">
                    <Tabs defaultValue="general" className="p-4">
                        <TabsList className="grid grid-cols-6 w-full">
                            <TabsTrigger value="general">General</TabsTrigger>
                            <TabsTrigger value="activity">Activity</TabsTrigger>
                            <TabsTrigger value="roles">Roles</TabsTrigger>
                            <TabsTrigger value="security">Security</TabsTrigger>
                            <TabsTrigger value="notifications">Notifications</TabsTrigger>
                            <TabsTrigger value="audit">Audit</TabsTrigger>
                        </TabsList>

                        <div className="mt-4 overflow-y-auto max-h-[calc(90vh-120px)]">
                            <TabsContent value="general" asChild>
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-6"
                                >
                                    {!user ? (
                                        <div className="text-muted-foreground p-8 text-center">
                                            No user selected.
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {/* User Header */}
                                            <div className="flex items-center gap-6 p-6 bg-muted/30 rounded-lg">
                                                <Avatar className="h-16 w-16">
                                                    <AvatarImage src={user.avatar ?? ""} alt={`${user.name} avatar`} />
                                                    <AvatarFallback className="text-lg">
                                                        {user.name.slice(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1">
                                                    <div className="text-xl font-semibold">{user.name}</div>
                                                    <div className="text-sm text-muted-foreground">{user.email}</div>
                                                    <div className="flex gap-2 mt-2">
                                                        <Badge variant="secondary">{user.role}</Badge>
                                                        {user.isVerified && (
                                                            <Badge variant="outline">Verified</Badge>
                                                        )}
                                                        {user.accountStatus && (
                                                            <Badge
                                                                variant={
                                                                    user.accountStatus === 'active'
                                                                        ? 'default'
                                                                        : user.accountStatus === 'suspended'
                                                                            ? 'destructive'
                                                                            : 'secondary'
                                                                }
                                                            >
                                                                {user.accountStatus}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Personal Information */}
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                <div className="space-y-4">
                                                    <h3 className="font-medium text-foreground">Personal Information</h3>
                                                    <div className="space-y-3">
                                                        <div>
                                                            <div className="text-sm font-medium text-muted-foreground">Phone</div>
                                                            <div className="text-sm">{user.phone || "—"}</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium text-muted-foreground">Date of Birth</div>
                                                            <div className="text-sm">
                                                                {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : "—"}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium text-muted-foreground">Member Since</div>
                                                            <div className="text-sm">
                                                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <h3 className="font-medium text-foreground">Address & Preferences</h3>
                                                    <div className="space-y-3">
                                                        <div>
                                                            <div className="text-sm font-medium text-muted-foreground">Address</div>
                                                            <div className="text-sm">
                                                                {user.address
                                                                    ? [
                                                                        user.address.street,
                                                                        user.address.city,
                                                                        user.address.state,
                                                                        user.address.country,
                                                                        user.address.zip
                                                                    ]
                                                                        .filter(Boolean)
                                                                        .join(", ")
                                                                    : "—"}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium text-muted-foreground">Language</div>
                                                            <div className="text-sm">{user.preferences?.language || "—"}</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium text-muted-foreground">Currency</div>
                                                            <div className="text-sm">{user.preferences?.currency || "—"}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            </TabsContent>

                            <TabsContent value="activity" asChild>
                                <UserActivityTab userId={user?._id || null} />
                            </TabsContent>

                            <TabsContent value="roles" asChild>
                                <UserRolesTab userId={user?._id || null} />
                            </TabsContent>

                            <TabsContent value="security" asChild>
                                <UserSecurityTab userId={user?._id || null} />
                            </TabsContent>

                            <TabsContent value="notifications" asChild>
                                <UserNotificationsTab userId={user?._id || null} />
                            </TabsContent>

                            <TabsContent value="audit" asChild>
                                <UserAuditTab userId={user?._id || null} />
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </DrawerContent>
        </Drawer>
    );
}