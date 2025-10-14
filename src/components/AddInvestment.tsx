import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Crown } from "lucide-react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Alert, AlertDescription } from "@/components/ui/alert";

const INVESTMENT_TYPES = [
  "Stocks",
  "Bonds",
  "Real Estate",
  "Cryptocurrency",
  "Mutual Funds",
  "Retirement Account",
  "Other"
];

const AddInvestment = () => {
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { subscribed } = useSubscription();

  const addInvestmentMutation = useMutation({
    mutationFn: async (data: { amount: number; type: string; description: string; date: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from('investments').insert({
        user_id: user.id,
        amount: data.amount,
        type: data.type,
        description: data.description,
        date: data.date,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      toast({ title: "Investment added successfully" });
      setAmount("");
      setType("");
      setDescription("");
      setDate(new Date().toISOString().split('T')[0]);
    },
    onError: () => {
      toast({ title: "Failed to add investment", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !type) {
      toast({ title: "Please fill in required fields", variant: "destructive" });
      return;
    }
    addInvestmentMutation.mutate({
      amount: parseFloat(amount),
      type,
      description,
      date,
    });
  };

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Add Investment
          <span className="text-sm font-normal text-muted-foreground">🎉 Free until Oct 24</span>
        </CardTitle>
        <CardDescription>
          Track your investments - Free access during Diwali offer!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border-amber-500/30">
          <Crown className="h-4 w-4 text-amber-500" />
          <AlertDescription>
            🪔 Diwali Special: Investment tracking is free for everyone until October 24, 2025!
          </AlertDescription>
        </Alert>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹) *</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground">₹</span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type *</Label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              required
            >
              <option value="">Select type</option>
              {INVESTMENT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Optional description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full" disabled={addInvestmentMutation.isPending}>
            {addInvestmentMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Investment
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddInvestment;
