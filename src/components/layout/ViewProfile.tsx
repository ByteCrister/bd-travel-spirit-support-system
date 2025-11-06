"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiCalendar, 
  FiX, 
  FiShield, 
  FiActivity,
  FiAward,
  FiClock,
  FiGlobe
} from "react-icons/fi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ViewProfileProps {
  isOpen: boolean;
  onClose: () => void;
  onEditProfile?: () => void;
  admin?: {
    name: string;
    email: string;
    avatar?: string;
    role: string;
    phone?: string;
    location?: string;
    joinDate?: string;
    lastActive?: string;
    department?: string;
    employeeId?: string;
    bio?: string;
    skills?: string[];
    achievements?: string[];
    recentActivity?: Array<{
      id: string;
      action: string;
      timestamp: string;
      type: 'login' | 'update' | 'action';
    }>;
  };
}

const mockAdmin = {
  name: "Sarah Johnson",
  email: "sarah@travelspirit.com",
  avatar: "/avatars/sarah.jpg",
  role: "Administrator",
  phone: "+1 (555) 123-4567",
  location: "New York, NY",
  joinDate: "January 15, 2023",
  lastActive: "2 hours ago",
  department: "Customer Support",
  employeeId: "EMP-2023-001",
  bio: "Experienced administrator with a passion for travel and customer service. Dedicated to ensuring smooth operations and exceptional user experiences.",
  skills: ["Customer Support", "Team Management", "Data Analysis", "Process Optimization"],
  achievements: ["Employee of the Month - March 2024", "Customer Satisfaction Award 2023", "Process Improvement Initiative Leader"],
  recentActivity: [
    { id: "1", action: "Updated user permissions", timestamp: "2 hours ago", type: "update" as const },
    { id: "2", action: "Responded to support ticket #1234", timestamp: "4 hours ago", type: "action" as const },
    { id: "3", action: "Logged in to dashboard", timestamp: "1 day ago", type: "login" as const },
    { id: "4", action: "Updated system settings", timestamp: "2 days ago", type: "update" as const },
    { id: "5", action: "Created new user account", timestamp: "3 days ago", type: "action" as const },
  ]
};

export function ViewProfile({ isOpen, onClose, onEditProfile, admin = mockAdmin }: ViewProfileProps) {
  console.log("ViewProfile rendered with isOpen:", isOpen);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login':
        return <FiShield className="h-4 w-4 text-green-500" />;
      case 'update':
        return <FiActivity className="h-4 w-4 text-blue-500" />;
      case 'action':
        return <FiActivity className="h-4 w-4 text-purple-500" />;
      default:
        return <FiActivity className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              console.log("Backdrop clicked");
              onClose();
            }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
              layout
            >
                {/* Header */}
                <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 text-white overflow-hidden">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-50">
                    <div className="absolute inset-0" style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                    }}></div>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log("Close button clicked");
                      onClose();
                    }}
                    className="absolute top-6 right-6 p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-200 backdrop-blur-sm border border-white/20 z-10"
                    aria-label="Close modal"
                  >
                    <FiX className="h-5 w-5" />
                  </button>
                  
                  <div className="relative flex items-center gap-6">
                    <div className="relative">
                      <Avatar className="h-24 w-24 border-4 border-white/30 shadow-2xl">
                        <AvatarImage src={admin.avatar} alt={admin.name} />
                        <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                          {getInitials(admin.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
                        {admin.name}
                      </h1>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-200 rounded-full text-sm font-medium border border-blue-400/30">
                          {admin.role}
                        </span>
                        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-200 rounded-full text-sm font-medium border border-emerald-400/30">
                          Active
                        </span>
                      </div>
                      <p className="text-slate-300 text-lg font-medium">{admin.department}</p>
                      <p className="text-slate-400 text-sm mt-1">Employee ID: {admin.employeeId}</p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Basic Info */}
                    <div className="lg:col-span-1 space-y-6">
                      {/* Contact Information */}
                      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
                        <CardHeader className="pb-4">
                          <CardTitle className="flex items-center gap-3 text-xl font-semibold text-slate-800 dark:text-slate-200">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                              <FiUser className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            Contact Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5">
                          <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                              <FiMail className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address</p>
                              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{admin.email}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                              <FiPhone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Phone Number</p>
                              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{admin.phone}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                              <FiMapPin className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Location</p>
                              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{admin.location}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Work Information */}
                      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
                        <CardHeader className="pb-4">
                          <CardTitle className="flex items-center gap-3 text-xl font-semibold text-slate-800 dark:text-slate-200">
                            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                              <FiAward className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            Work Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5">
                          <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                              <FiCalendar className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Join Date</p>
                              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{admin.joinDate}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                              <FiClock className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Last Active</p>
                              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{admin.lastActive}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-lg">
                              <FiGlobe className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Employee ID</p>
                              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{admin.employeeId}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Skills */}
                      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
                        <CardHeader className="pb-4">
                          <CardTitle className="flex items-center gap-3 text-xl font-semibold text-slate-800 dark:text-slate-200">
                            <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                              <FiAward className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                            </div>
                            Skills & Expertise
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-3">
                            {admin.skills?.map((skill, index) => (
                              <Badge 
                                key={index} 
                                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 font-medium text-sm hover:from-blue-600 hover:to-indigo-700 transition-all duration-200"
                              >
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Right Column - Bio and Activity */}
                    <div className="lg:col-span-2 space-y-6">
                      {/* Bio */}
                      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
                        <CardHeader className="pb-4">
                          <CardTitle className="flex items-center gap-3 text-xl font-semibold text-slate-800 dark:text-slate-200">
                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                              <FiUser className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            About
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-base font-medium">
                            {admin.bio}
                          </p>
                        </CardContent>
                      </Card>

                      {/* Achievements */}
                      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
                        <CardHeader className="pb-4">
                          <CardTitle className="flex items-center gap-3 text-xl font-semibold text-slate-800 dark:text-slate-200">
                            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                              <FiAward className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            Achievements & Recognition
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {admin.achievements?.map((achievement, index) => (
                              <div key={index} className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl border border-yellow-200/50 dark:border-yellow-800/30 hover:shadow-md transition-all duration-200">
                                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/40 rounded-lg">
                                  <FiAward className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                                </div>
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{achievement}</p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Recent Activity */}
                      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
                        <CardHeader className="pb-4">
                          <CardTitle className="flex items-center gap-3 text-xl font-semibold text-slate-800 dark:text-slate-200">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                              <FiActivity className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            Recent Activity
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {admin.recentActivity?.map((activity, index) => (
                              <motion.div
                                key={activity.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-all duration-200 border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                              >
                                <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                                  {getActivityIcon(activity.type)}
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{activity.action}</p>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{activity.timestamp}</p>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-slate-200 dark:border-slate-700 p-6 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50">
                  <div className="flex justify-center gap-4">
                    <Button 
                      variant="outline" 
                      onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                      }}
                      className="px-6 py-3 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium"
                    >
                      Close
                    </Button>
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                        onEditProfile?.();
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      Edit Profile
                    </Button>
                  </div>
                </div>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
