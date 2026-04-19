
-- Create offers table
CREATE TABLE public.offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text NOT NULL,
  storage_path text,
  start_date timestamp with time zone NOT NULL DEFAULT now(),
  end_date timestamp with time zone NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

-- Public can view active offers
CREATE POLICY "Anyone can view offers" ON public.offers FOR SELECT USING (true);

-- Admin CRUD
CREATE POLICY "Admins can insert offers" ON public.offers FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update offers" ON public.offers FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete offers" ON public.offers FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Create storage bucket for offers
INSERT INTO storage.buckets (id, name, public) VALUES ('offers', 'offers', true);

-- Storage policies for offers bucket
CREATE POLICY "Anyone can view offer images" ON storage.objects FOR SELECT USING (bucket_id = 'offers');
CREATE POLICY "Admins can upload offer images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'offers' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete offer images" ON storage.objects FOR DELETE USING (bucket_id = 'offers' AND public.has_role(auth.uid(), 'admin'));
