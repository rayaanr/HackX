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
          <Link href="/hackathons/create" className="w-full">
            <Button className="w-full justify-start" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Create New Hackathon
            </Button>
          </Link>
          
          <Link href="/hackathons" className="w-full">
            <Button className="w-full justify-start" variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              View All Events
            </Button>
          </Link>
          
          <Link href="/projects" className="w-full">
            <Button className="w-full justify-start" variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Manage Projects
            </Button>
          </Link>
          
          <Button className="w-full justify-start" variant="outline" disabled>
            <Settings className="h-4 w-4 mr-2" />
            Event Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}