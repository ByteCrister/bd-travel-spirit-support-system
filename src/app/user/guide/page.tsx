import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FiStar, FiMapPin, FiCalendar, FiUsers } from "react-icons/fi";

export default function GuidesPage() {
  const guides = [
    {
      id: 1,
      name: "Emily Davis",
      location: "Paris, France",
      rating: 4.9,
      tours: 45,
      joinDate: "2023-06-15",
      status: "verified",
      specialties: ["Historical Tours", "Food Tours"],
    },
    {
      id: 2,
      name: "Carlos Rodriguez",
      location: "Barcelona, Spain",
      rating: 4.8,
      tours: 32,
      joinDate: "2023-08-20",
      status: "verified",
      specialties: ["Art Tours", "Architecture"],
    },
    {
      id: 3,
      name: "Anna Kim",
      location: "Seoul, South Korea",
      rating: 4.7,
      tours: 28,
      joinDate: "2023-09-10",
      status: "pending",
      specialties: ["Cultural Tours", "Nightlife"],
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Guides</h1>
        <p className="text-muted-foreground">
          Manage and review all registered tour guides on the platform.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {guides.map((guide) => (
          <Card key={guide.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{guide.name}</CardTitle>
                <Badge variant={guide.status === "verified" ? "default" : "secondary"}>
                  {guide.status}
                </Badge>
              </div>
              <CardDescription className="flex items-center gap-1">
                <FiMapPin className="h-4 w-4" />
                {guide.location}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <FiStar className="h-4 w-4 text-yellow-500" />
                <span className="font-medium">{guide.rating}</span>
                <span className="text-muted-foreground">rating</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FiUsers className="h-4 w-4" />
                {guide.tours} tours completed
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FiCalendar className="h-4 w-4" />
                Joined {guide.joinDate}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Specialties:</p>
                <div className="flex flex-wrap gap-1">
                  {guide.specialties.map((specialty, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline">
                  View Profile
                </Button>
                <Button size="sm" variant="outline">
                  Reviews
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
