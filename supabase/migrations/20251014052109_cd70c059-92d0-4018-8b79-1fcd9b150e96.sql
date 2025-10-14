-- Create subscription status table
CREATE TABLE IF NOT EXISTS public.subscription_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  subscribed BOOLEAN DEFAULT FALSE,
  product_id TEXT,
  subscription_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscription_status ENABLE ROW LEVEL SECURITY;

-- Policies for subscription_status
CREATE POLICY "Users can view their own subscription status"
ON public.subscription_status
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription status"
ON public.subscription_status
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription status"
ON public.subscription_status
FOR UPDATE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subscription_status_updated_at
BEFORE UPDATE ON public.subscription_status
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create notification_log table for Twilio notifications
CREATE TABLE IF NOT EXISTS public.notification_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notification_log ENABLE ROW LEVEL SECURITY;

-- Policies for notification_log
CREATE POLICY "Users can view their own notifications"
ON public.notification_log
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Service can insert notifications"
ON public.notification_log
FOR INSERT
WITH CHECK (true);