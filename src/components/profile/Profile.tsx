
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Settings, Building, Clock, MessageSquare, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Profile = () => {
  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your salon profile has been updated successfully.",
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Salon Profile & Settings</h1>
        <p className="text-gray-600">Manage your salon information and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Salon Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-purple-600" />
              <span>Salon Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" defaultValue="John" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" defaultValue="Doe" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="salonName">Salon Name</Label>
              <Input id="salonName" defaultValue="Elegant Hair Studio" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="john@eleganthair.com" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" defaultValue="+1 (555) 123-4567" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea 
                id="address" 
                defaultValue="123 Main Street, Downtown, City, State 12345"
                rows={3}
              />
            </div>

            <Button onClick={handleSave} className="w-full bg-purple-600 hover:bg-purple-700">
              <Save className="h-4 w-4 mr-2" />
              Save Information
            </Button>
          </CardContent>
        </Card>

        {/* Business Settings */}
        <div className="space-y-6">
          {/* Business Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-purple-600" />
                <span>Business Hours</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { day: "Monday", open: "09:00", close: "18:00" },
                { day: "Tuesday", open: "09:00", close: "18:00" },
                { day: "Wednesday", open: "09:00", close: "18:00" },
                { day: "Thursday", open: "09:00", close: "20:00" },
                { day: "Friday", open: "09:00", close: "20:00" },
                { day: "Saturday", open: "08:00", close: "17:00" },
                { day: "Sunday", open: "Closed", close: "" }
              ].map((schedule, index) => (
                <div key={index} className="grid grid-cols-3 gap-4 items-center">
                  <Label className="font-medium">{schedule.day}</Label>
                  {schedule.open !== "Closed" ? (
                    <>
                      <Input type="time" defaultValue={schedule.open} />
                      <Input type="time" defaultValue={schedule.close} />
                    </>
                  ) : (
                    <div className="col-span-2 text-gray-500">Closed</div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-purple-600" />
                <span>Notification Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-3">SMS/WhatsApp Templates</h4>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="birthdayTemplate">Birthday Message</Label>
                    <Textarea 
                      id="birthdayTemplate"
                      defaultValue="🎉 Happy Birthday {name}! We hope you have a wonderful day. Visit us for a special birthday treatment with 20% off!"
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="anniversaryTemplate">Anniversary Message</Label>
                    <Textarea 
                      id="anniversaryTemplate"
                      defaultValue="💕 Happy Anniversary {name}! Celebrate your special day with us. Book a couple's treatment and save 15%!"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3">Reminder Settings</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Send birthday reminders</Label>
                    <select className="border rounded px-3 py-1">
                      <option>7 days before</option>
                      <option>3 days before</option>
                      <option>1 day before</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Send anniversary reminders</Label>
                    <select className="border rounded px-3 py-1">
                      <option>7 days before</option>
                      <option>3 days before</option>
                      <option>1 day before</option>
                    </select>
                  </div>
                </div>
              </div>

              <Button onClick={handleSave} className="w-full bg-purple-600 hover:bg-purple-700">
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
