-- Enable realtime for assets table
ALTER TABLE public.assets REPLICA IDENTITY FULL;

-- Add assets table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.assets;