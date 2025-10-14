import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PiggyBank, Plus, Trash2, AlertTriangle, CheckCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const BudgetTracker = () => {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [period, setPeriod] = useState("monthly");
  const queryClient = useQueryClient();

  const { data: budgets } = useQuery({
    queryKey: ['budgets'],
    queryFn: async () => {
      const { data, error } = await supabase.from('budgets').select('*');
      if (error) throw error;
      return data || [];
    },
  });

  const { data: expenses } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const { data, error } = await supabase.from('expenses').select('*');
      if (error) throw error;
      return data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from('budgets').insert({
        user_id: user.id,
        category,
        amount: parseFloat(amount),
        period,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success("Budget created successfully");
      setOpen(false);
      setCategory("");
      setAmount("");
      setPeriod("monthly");
    },
    onError: () => {
      toast.error("Failed to create budget");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('budgets').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success("Budget deleted successfully");
    },
  });

  const calculateSpent = (budgetCategory: string) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return expenses
      ?.filter(exp => {
        const expDate = new Date(exp.date);
        return exp.category === budgetCategory &&
               expDate.getMonth() === currentMonth &&
               expDate.getFullYear() === currentYear;
      })
      .reduce((sum, exp) => sum + Number(exp.amount), 0) || 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Budget Tracker</h2>
          <p className="text-muted-foreground">Set and monitor your spending limits</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary shadow-glow">
              <Plus className="h-4 w-4 mr-2" />
              Add Budget
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Budget</DialogTitle>
              <DialogDescription>Set a spending limit for a category</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g., Food, Transportation"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Budget Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="period">Period</Label>
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                Create Budget
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {budgets?.map((budget) => {
          const spent = calculateSpent(budget.category);
          const percentage = (spent / Number(budget.amount)) * 100;
          const isOverBudget = percentage > 100;
          const isNearLimit = percentage > 80 && percentage <= 100;

          return (
            <Card key={budget.id} className={isOverBudget ? "border-destructive" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <PiggyBank className="h-5 w-5" />
                    <CardTitle className="text-lg">{budget.category}</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteMutation.mutate(budget.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <CardDescription className="capitalize">{budget.period} budget</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Spent</span>
                  <span className={`font-semibold ${isOverBudget ? 'text-destructive' : ''}`}>
                    ${spent.toFixed(2)} / ${Number(budget.amount).toFixed(2)}
                  </span>
                </div>
                <Progress value={Math.min(percentage, 100)} className="h-2" />
                
                {isOverBudget && (
                  <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                    <AlertTriangle className="h-3 w-3" />
                    Over budget by ${(spent - Number(budget.amount)).toFixed(2)}
                  </Badge>
                )}
                {isNearLimit && !isOverBudget && (
                  <Badge variant="secondary" className="flex items-center gap-1 w-fit bg-warning text-warning-foreground">
                    <AlertTriangle className="h-3 w-3" />
                    {(100 - percentage).toFixed(0)}% remaining
                  </Badge>
                )}
                {!isNearLimit && !isOverBudget && (
                  <Badge variant="secondary" className="flex items-center gap-1 w-fit bg-success text-success-foreground">
                    <CheckCircle className="h-3 w-3" />
                    On track
                  </Badge>
                )}
              </CardContent>
            </Card>
          );
        })}

        {budgets?.length === 0 && (
          <Card className="md:col-span-2">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <PiggyBank className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                No budgets set yet. Create your first budget to start tracking your spending!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BudgetTracker;