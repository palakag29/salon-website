
CREATE TABLE public.instagram_reels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reel_url TEXT NOT NULL,
  title TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.instagram_reels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reels" ON public.instagram_reels FOR SELECT USING (true);
CREATE POLICY "Admins can insert reels" ON public.instagram_reels FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update reels" ON public.instagram_reels FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete reels" ON public.instagram_reels FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
