
CREATE TABLE public.reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  rating integer NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  text text NOT NULL,
  service text NOT NULL,
  image_url text,
  storage_path text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT TO public USING (true);
CREATE POLICY "Admins can insert reviews" ON public.reviews FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update reviews" ON public.reviews FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete reviews" ON public.reviews FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
