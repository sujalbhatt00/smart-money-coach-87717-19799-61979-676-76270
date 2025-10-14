import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Bell, Crown, Loader2 } from "lucide-react";

const Notifications = () => {
  const { subscribed } = useSubscription();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneNumber || !message) {
      toast({
        title: "Missing Information",
        description: "Please provide both phone number and message.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke("send-notification", {
        body: {
          to: phoneNumber,
          message: message,
          type: "manual",
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Notification Sent",
          description: "Your notification has been sent successfully!",
        });
        setMessage("");
        setPhoneNumber("");
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      toast({
        title: "Error",
        description: "Failed to send notification. Please check your Twilio settings.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Bell className="h-8 w-8" />
          Notifications
        </h1>
        <p className="text-muted-foreground">
          Send SMS notifications for important financial updates
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Send SMS Notification
          </CardTitle>
          <CardDescription>
            Send custom SMS notifications to your phone
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSendNotification} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1234567890"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Enter your notification message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isLoading}
                rows={4}
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Bell className="mr-2 h-4 w-4" />
                  Send Notification
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Automatic Notifications</CardTitle>
          <CardDescription>
            Premium members receive automatic SMS notifications for:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              <span>Large expenses or income entries</span>
            </li>
            <li className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              <span>Weekly financial summary</span>
            </li>
            <li className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              <span>Important AI recommendations</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default Notifications;
