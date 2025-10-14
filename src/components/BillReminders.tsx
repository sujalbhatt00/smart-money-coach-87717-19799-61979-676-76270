import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Bell, Plus, CheckCircle, Trash2, Clock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { format, isPast, differenceInDays } from "date-fns";

const BillReminders = () => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");
  const queryClient = useQueryClient();

  const { data: bills } = useQuery({
    queryKey: ['bills'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .order('due_date', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from('bills').insert({
        user_id: user.id,
        title,
        amount: parseFloat(amount),
        due_date: dueDate,
        category,
        notes,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      toast.success("Bill reminder created");
      setOpen(false);
      setTitle("");
      setAmount("");
      setDueDate("");
      setCategory("");
      setNotes("");
    },
    onError: () => {
      toast.error("Failed to create bill reminder");
    },
  });

  const markPaidMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('bills')
        .update({ is_paid: true, paid_date: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      toast.success("Bill marked as paid");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('bills').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      toast.success("Bill deleted");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate();
  };

  const getDaysUntilDue = (dueDate: string) => {
    return differenceInDays(new Date(dueDate), new Date());
  };

  const unpaidBills = bills?.filter(b => !b.is_paid) || [];
  const paidBills = bills?.filter(b => b.is_paid) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Bill Reminders</h2>
          <p className="text-muted-foreground">Never miss a payment deadline</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary shadow-glow">
              <Plus className="h-4 w-4 mr-2" />
              Add Bill
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Bill Reminder</DialogTitle>
              <DialogDescription>Set up a reminder for an upcoming bill</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Bill Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Electric Bill"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
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
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g., Utilities"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any additional notes..."
                />
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                Add Bill Reminder
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {unpaidBills.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Upcoming Bills
          </h3>
          <div className="grid gap-4">
            {unpaidBills.map((bill) => {
              const daysUntil = getDaysUntilDue(bill.due_date);
              const isOverdue = isPast(new Date(bill.due_date)) && daysUntil < 0;
              const isDueSoon = daysUntil <= 3 && daysUntil >= 0;

              return (
                <Card 
                  key={bill.id}
                  className={isOverdue ? "border-destructive" : isDueSoon ? "border-warning" : ""}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2 flex-1">
                        <Bell className="h-5 w-5" />
                        <div>
                          <CardTitle className="text-lg">{bill.title}</CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary">{bill.category}</Badge>
                            <span className="text-sm">
                              Due: {format(new Date(bill.due_date), "MMM dd, yyyy")}
                            </span>
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markPaidMutation.mutate(bill.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Mark Paid
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMutation.mutate(bill.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        {isOverdue && (
                          <Badge variant="destructive">
                            Overdue by {Math.abs(daysUntil)} days
                          </Badge>
                        )}
                        {isDueSoon && !isOverdue && (
                          <Badge className="bg-warning text-warning-foreground">
                            Due in {daysUntil} {daysUntil === 1 ? 'day' : 'days'}
                          </Badge>
                        )}
                        {!isDueSoon && !isOverdue && (
                          <Badge variant="secondary">
                            {daysUntil} days remaining
                          </Badge>
                        )}
                        {bill.notes && (
                          <p className="text-sm text-muted-foreground mt-2">{bill.notes}</p>
                        )}
                      </div>
                      <div className="text-2xl font-bold">
                        ${Number(bill.amount).toFixed(2)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {paidBills.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-success" />
            Paid Bills
          </h3>
          <div className="grid gap-4">
            {paidBills.map((bill) => (
              <Card key={bill.id} className="opacity-60">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      <CheckCircle className="h-5 w-5 text-success" />
                      <div>
                        <CardTitle className="text-lg">{bill.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary">{bill.category}</Badge>
                          <span className="text-sm">
                            Paid: {bill.paid_date ? format(new Date(bill.paid_date), "MMM dd, yyyy") : "-"}
                          </span>
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMutation.mutate(bill.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}

      {bills?.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              No bill reminders yet. Add your first bill to get started!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BillReminders;