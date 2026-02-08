"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FiCalendar,  
  FiMapPin, 
  FiEye,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle
} from "react-icons/fi";
import { cn } from "@/lib/utils";
import { Booking } from "@/types/dashboard/dashboard.types";
import { FaBangladeshiTakaSign } from "react-icons/fa6";

interface RecentBookingsProps {
  bookings: Booking[];
  loading?: boolean;
  onView?: (bookingId: string) => void;
  className?: string;
}

const getStatusIcon = (status: Booking['status']) => {
  switch (status) {
    case 'confirmed':
      return <FiCheckCircle className="h-4 w-4" />;
    case 'pending':
      return <FiClock className="h-4 w-4" />;
    case 'cancelled':
      return <FiXCircle className="h-4 w-4" />;
    case 'completed':
      return <FiCheckCircle className="h-4 w-4" />;
    default:
      return <FiAlertCircle className="h-4 w-4" />;
  }
};

const getStatusColor = (status: Booking['status']) => {
  switch (status) {
    case 'confirmed':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    case 'cancelled':
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    case 'completed':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    default:
      return 'bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-400';
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export function RecentBookings({ bookings, loading = false, onView, className }: RecentBookingsProps) {
  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FiCalendar className="h-5 w-5" />
            Recent Bookings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-32" />
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-24" />
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-16" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-12" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FiCalendar className="h-5 w-5" />
          Recent Bookings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {bookings.length === 0 ? (
              <div className="text-center py-8">
                <FiCalendar className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <p className="text-slate-500 dark:text-slate-400">No recent bookings</p>
              </div>
            ) : (
              bookings.map((booking, index) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium text-sm">
                        {booking.user.name.charAt(0).toUpperCase()}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                            {booking.user.name}
                          </h4>
                          <Badge className={cn("text-xs", getStatusColor(booking.status))}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(booking.status)}
                              {booking.status}
                            </div>
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                          {booking.tour.title}
                        </p>
                        
                        <div className="flex items-center gap-2 mt-1">
                          <FiMapPin className="h-3 w-3 text-slate-400" />
                          <span className="text-xs text-slate-500 dark:text-slate-500">
                            {booking.tour.destination}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right ml-4">
                      <div className="flex items-center gap-1 mb-1">
                        <FaBangladeshiTakaSign className="h-3 w-3 text-green-600 dark:text-green-400" />
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {formatCurrency(booking.amount)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1 mb-2">
                        <FiClock className="h-3 w-3 text-slate-400" />
                        <span className="text-xs text-slate-500 dark:text-slate-500">
                          {formatDate(booking.bookingDate)}
                        </span>
                      </div>
                      
                      {onView && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onView(booking.id)}
                          className="h-7 px-2 text-xs"
                        >
                          <FiEye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
