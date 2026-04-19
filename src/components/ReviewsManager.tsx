import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, X, Star, MessageSquare } from "lucide-react";

interface Review {
  id: string;
  name: string;
  rating: number;
  text: string;
  service: string;
  image_url: string | null;
  storage_path: string | null;
}

const ReviewsManager = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [service, setService] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: ["admin-reviews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const resetForm = () => {
    setName("");
    setRating(5);
    setText("");
    setService("");
    setImageFile(null);
    setImagePreview(null);
    setEditingId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  const uploadImage = async (file: File): Promise<{ url: string; path: string }> => {
    const path = `reviews/${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${file.name.split(".").pop()}`;
    const { error } = await supabase.storage.from("gallery").upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from("gallery").getPublicUrl(path);
    return { url: data.publicUrl, path };
  };

  const addReview = useMutation({
    mutationFn: async () => {
      if (!name.trim() || !text.trim() || !service.trim()) throw new Error("Name, review text, and service are required");

      let imageUrl: string | null = null;
      let storagePath: string | null = null;

      if (imageFile) {
        const result = await uploadImage(imageFile);
        imageUrl = result.url;
        storagePath = result.path;
      }

      const { error } = await supabase.from("reviews").insert({
        name: name.trim(),
        rating,
        text: text.trim(),
        service: service.trim(),
        image_url: imageUrl,
        storage_path: storagePath,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Review added!");
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const updateReview = useMutation({
    mutationFn: async () => {
      if (!editingId || !name.trim() || !text.trim() || !service.trim()) throw new Error("All fields required");

      let imageUrl: string | null = null;
      let storagePath: string | null = null;

      if (imageFile) {
        const result = await uploadImage(imageFile);
        imageUrl = result.url;
        storagePath = result.path;
      }

      const { error } = await supabase
        .from("reviews")
        .update({
          name: name.trim(),
          rating,
          text: text.trim(),
          service: service.trim(),
          ...(imageUrl && { image_url: imageUrl, storage_path: storagePath }),
        })
        .eq("id", editingId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Review updated!");
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteReview = useMutation({
    mutationFn: async (review: Review) => {
      if (review.storage_path) {
        await supabase.storage.from("gallery").remove([review.storage_path]);
      }
      const { error } = await supabase.from("reviews").delete().eq("id", review.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Review deleted!");
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const startEdit = (review: Review) => {
    setEditingId(review.id);
    setName(review.name);
    setRating(review.rating);
    setText(review.text);
    setService(review.service);
    setImagePreview(review.image_url);
    setImageFile(null);
  };

  return (
    <div className="space-y-6">

      {/* FORM */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label>Client Name *</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Priya Sharma" />
        </div>
        <div>
          <Label>Service *</Label>
          <Input value={service} onChange={(e) => setService(e.target.value)} placeholder="e.g. Bridal Makeup" />
        </div>
        <div>
          <Label>Rating *</Label>
          <div className="flex gap-1 mt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="focus:outline-none"
              >
                <Star
                  className={`w-6 h-6 transition-colors ${
                    star <= rating ? "fill-primary text-primary" : "text-muted-foreground/30"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label>Profile Image</Label>
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>
        <div className="sm:col-span-2">
          <Label>Review Text *</Label>
          <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Client's review..." />
        </div>
        {imagePreview && (
          <div className="flex items-center gap-3">
            <img src={imagePreview} alt="Preview" className="w-16 h-16 rounded-full object-cover border border-border" />
            <span className="text-xs text-muted-foreground">Image preview</span>
          </div>
        )}
      </div>

      {/* BUTTONS */}
      <div className="flex gap-3">
        {editingId ? (
          <>
            <Button onClick={() => updateReview.mutate()} disabled={updateReview.isPending}>
              <Pencil className="w-4 h-4 mr-1" /> Update
            </Button>
            <Button variant="ghost" onClick={resetForm}>
              <X className="w-4 h-4 mr-1" /> Cancel
            </Button>
          </>
        ) : (
          <Button onClick={() => addReview.mutate()} disabled={addReview.isPending}>
            <Plus className="w-4 h-4 mr-1" /> Add Review
          </Button>
        )}
      </div>

      {/* GRID */}
      {reviews.length === 0 ? (
        <p className="text-muted-foreground text-sm">No reviews yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {reviews.map((review) => (
            <div key={review.id} className="group rounded-xl overflow-hidden border border-border bg-card hover:shadow-lg transition">
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  {review.image_url ? (
                    <img src={review.image_url} alt={review.name} className="w-10 h-10 rounded-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                      {review.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-sm">{review.name}</h3>
                    <span className="text-xs text-primary">{review.service}</span>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-3 h-3 ${i < review.rating ? "fill-primary text-primary" : "text-muted-foreground/30"}`} />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-3 italic">"{review.text}"</p>
              </div>
              <div className="flex justify-between px-4 pb-3">
                <button onClick={() => startEdit(review)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => deleteReview.mutate(review)} className="text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewsManager;
