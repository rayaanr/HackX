import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Users, Settings } from "lucide-react";

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          <Button asChild className="w-full justify-start" variant="outline">
            <Link href="/hackathons/create">
              <Plus className="h-4 w-4 mr-2" />
              Create New Hackathon
            </Link>
          </Button>

          <Button asChild className="w-full justify-start" variant="outline">
            <Link href="/hackathons">
              <Calendar className="h-4 w-4 mr-2" />
              View All Events
            </Link>
          </Button>

          <Button asChild className="w-full justify-start" variant="outline">
            <Link href="/projects">
              <Users className="h-4 w-4 mr-2" />
              Manage Projects
            </Link>
          </Button>

          <Button className="w-full justify-start" variant="outline" disabled>
            <Settings className="h-4 w-4 mr-2" />
            Event Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
