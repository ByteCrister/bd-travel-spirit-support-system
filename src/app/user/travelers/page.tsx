import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FiUser, FiMail, FiCalendar, FiMapPin } from "react-icons/fi";

export default function TravelersPage() {
  const travelers = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      joinDate: "2024-01-15",
      location: "New York, USA",
      status: "active",
      bookings: 12,
    },
    {
      id: 2,
      name: "Sarah Wilson",
      email: "sarah@example.com",
      joinDate: "2024-02-20",
      location: "London, UK",
      status: "active",
      bookings: 8,
    },
    {
      id: 3,
      name: "Mike Chen",
      email: "mike@example.com",
      joinDate: "2024-01-30",
      location: "Tokyo, Japan",
      status: "inactive",
      bookings: 3,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Travelers</h1>
        <p className="text-muted-foreground">
          Manage and view all registered travelers on the platform.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {travelers.map((traveler) => (
          <Card key={traveler.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{traveler.name}</CardTitle>
                <Badge variant={traveler.status === "active" ? "default" : "secondary"}>
                  {traveler.status}
                </Badge>
              </div>
              <CardDescription>{traveler.email}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FiMapPin className="h-4 w-4" />
                {traveler.location}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FiCalendar className="h-4 w-4" />
                Joined {traveler.joinDate}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FiUser className="h-4 w-4" />
                {traveler.bookings} bookings
              </div>
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline">
                  View Profile
                </Button>
                <Button size="sm" variant="outline">
                  <FiMail className="h-4 w-4 mr-1" />
                  Contact
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
