
-- Create user roles table and function
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create gallery categories table
CREATE TABLE public.gallery_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.gallery_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view gallery categories"
  ON public.gallery_categories FOR SELECT USING (true);

CREATE POLICY "Admins can insert gallery categories"
  ON public.gallery_categories FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update gallery categories"
  ON public.gallery_categories FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete gallery categories"
  ON public.gallery_categories FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create gallery images table
CREATE TABLE public.gallery_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.gallery_categories(id) ON DELETE CASCADE,
  title TEXT,
  image_url TEXT NOT NULL,
  storage_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view gallery images"
  ON public.gallery_images FOR SELECT USING (true);

CREATE POLICY "Admins can insert gallery images"
  ON public.gallery_images FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update gallery images"
  ON public.gallery_images FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete gallery images"
  ON public.gallery_images FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create storage bucket for gallery images
INSERT INTO storage.buckets (id, name, public) VALUES ('gallery', 'gallery', true);

CREATE POLICY "Gallery images are publicly accessible"
  ON storage.objects FOR SELECT USING (bucket_id = 'gallery');

CREATE POLICY "Admins can upload gallery images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'gallery' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete gallery images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'gallery' AND public.has_role(auth.uid(), 'admin'));

-- Insert default gallery categories
INSERT INTO public.gallery_categories (name, slug) VALUES
  ('Bridal Makeup', 'bridal-makeup'),
  ('Hair Styles', 'hair-styles'),
  ('Nail Art', 'nail-art');
