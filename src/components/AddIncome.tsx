import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const INCOME_SOURCES = [
  "Salary",
  "Freelance",
  "Business",
  "Investments",
  "Rental",
  "Other"
];

const AddIncome = () => {
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addIncomeMutation = useMutation({
    mutationFn: async (data: { amount: number; source: string; description: string; date: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from('income').insert({
        user_id: user.id,
        amount: data.amount,
        source: data.source,
        description: data.description,
        date: data.date,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income'] });
      toast({ title: "Income added successfully" });
      setAmount("");
      setSource("");
      setDescription("");
      setDate(new Date().toISOString().split('T')[0]);
    },
    onError: () => {
      toast({ title: "Failed to add income", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !source) {
      toast({ title: "Please fill in required fields", variant: "destructive" });
      return;
    }
    addIncomeMutation.mutate({
      amount: parseFloat(amount),
      source,
      description,
      date,
    });
  };

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle>Add Income</CardTitle>
      </CardHeader>
      <CardContent>
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
            <Label htmlFor="source">Source *</Label>
            <select
              id="source"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              required
            >
              <option value="">Select source</option>
              {INCOME_SOURCES.map((src) => (
                <option key={src} value={src}>{src}</option>
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

          <Button type="submit" className="w-full" disabled={addIncomeMutation.isPending}>
            {addIncomeMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Income
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddIncome;
