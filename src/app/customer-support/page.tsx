import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FiMessageCircle, FiClock, FiUser, FiAlertCircle } from "react-icons/fi";

export default function CustomerSupportPage() {
  const tickets = [
    {
      id: "T-001",
      title: "Booking cancellation issue",
      customer: "John Doe",
      priority: "high",
      status: "open",
      createdAt: "2 hours ago",
      lastMessage: "I need to cancel my booking but the system won't let me...",
    },
    {
      id: "T-002",
      title: "Payment not processed",
      customer: "Sarah Wilson",
      priority: "medium",
      status: "in-progress",
      createdAt: "4 hours ago",
      lastMessage: "My payment was charged but the booking didn't confirm...",
    },
    {
      id: "T-003",
      title: "Guide not responding",
      customer: "Mike Chen",
      priority: "low",
      status: "resolved",
      createdAt: "1 day ago",
      lastMessage: "My guide hasn't responded to my messages for 2 days...",
    },
    {
      id: "T-004",
      title: "Refund request",
      customer: "Emily Davis",
      priority: "medium",
      status: "open",
      createdAt: "3 hours ago",
      lastMessage: "I would like to request a refund for my recent booking...",
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "destructive";
      case "in-progress":
        return "default";
      case "resolved":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Customer Support</h1>
        <p className="text-muted-foreground">
          Manage and respond to customer support tickets and inquiries.
        </p>
      </div>

      <div className="grid gap-4">
        {tickets.map((ticket) => (
          <Card key={ticket.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{ticket.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <FiUser className="h-4 w-4" />
                    {ticket.customer}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge variant={getPriorityColor(ticket.priority)}>
                    {ticket.priority}
                  </Badge>
                  <Badge variant={getStatusColor(ticket.status)}>
                    {ticket.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FiClock className="h-4 w-4" />
                  Created {ticket.createdAt}
                </div>
                <div className="flex items-start gap-2">
                  <FiMessageCircle className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {ticket.lastMessage}
                  </p>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                  <Button size="sm" variant="outline">
                    Reply
                  </Button>
                  {ticket.status === "open" && (
                    <Button size="sm">
                      Assign to Me
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
