
-- Remove redundant overlapping ALL policy on gallery_images
DROP POLICY IF EXISTS "Only admins can manage images" ON public.gallery_images;

-- Storage policies for "gallery" bucket
-- Admin-only upload
CREATE POLICY "Admins can upload to gallery"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'gallery'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Admin-only update
CREATE POLICY "Admins can update gallery files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'gallery'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Admin-only delete
CREATE POLICY "Admins can delete from gallery"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'gallery'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Public read for gallery bucket
CREATE POLICY "Anyone can view gallery files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'gallery');

-- Storage policies for "offers" bucket
CREATE POLICY "Admins can upload to offers"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'offers'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Admins can update offers files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'offers'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Admins can delete from offers"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'offers'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Anyone can view offers files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'offers');
