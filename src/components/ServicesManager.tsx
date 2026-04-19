import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, X, Sparkles } from "lucide-react";

interface Service {
  id: string;
  title: string | null;
  description: string | null;
  price: string | null;
  image_url: string | null;
}

const ServicesManager = () => {
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // FETCH SERVICES
  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ["admin-services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPrice("");
    setImageFile(null);
    setEditingId(null);
  };

  // ADD SERVICE
  const addService = useMutation({
    mutationFn: async () => {
      if (!title.trim()) throw new Error("Title is required");

      let imageUrl = null;

      if (imageFile) {
        const path = `services/${Date.now()}-${imageFile.name}`;

        const { error: uploadError } = await supabase.storage
          .from("gallery")
          .upload(path, imageFile);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from("gallery").getPublicUrl(path);
        imageUrl = data.publicUrl;
      }

      const { error } = await supabase.from("services").insert({
        title: title.trim(),
        description: description.trim() || null,
        price: price.trim() || null,
        image_url: imageUrl,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Service added!");
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["admin-services"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  // UPDATE SERVICE
  const updateService = useMutation({
    mutationFn: async () => {
      if (!editingId || !title.trim()) throw new Error("Title required");

      let imageUrl = null;

      if (imageFile) {
        const path = `services/${Date.now()}-${imageFile.name}`;

        const { error: uploadError } = await supabase.storage
          .from("gallery")
          .upload(path, imageFile);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from("gallery").getPublicUrl(path);
        imageUrl = data.publicUrl;
      }

      const { error } = await supabase
        .from("services")
        .update({
          title: title.trim(),
          description: description.trim() || null,
          price: price.trim() || null,
          ...(imageUrl && { image_url: imageUrl }),
        })
        .eq("id", editingId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Service updated!");
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["admin-services"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  // DELETE
  const deleteService = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("services").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Service deleted!");
      queryClient.invalidateQueries({ queryKey: ["admin-services"] });
    },
  });

  const startEdit = (service: Service) => {
    setEditingId(service.id);
    setTitle(service.title || "");
    setDescription(service.description || "");
    setPrice(service.price || "");
  };

  return (
    <div className="space-y-6">

      {/* FORM */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label>Title *</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div>
          <Label>Price</Label>
          <Input value={price} onChange={(e) => setPrice(e.target.value)} />
        </div>

        <div className="sm:col-span-2">
          <Label>Description</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <div className="sm:col-span-2">
          <Label>Upload Image</Label>
          <Input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
        </div>

        {/* Preview */}
        {imageFile && (
          <img
            src={URL.createObjectURL(imageFile)}
            className="w-24 h-24 object-cover rounded-lg"
          />
        )}
      </div>

      {/* BUTTONS */}
      <div className="flex gap-3">
        {editingId ? (
          <>
            <Button onClick={() => updateService.mutate()}>
              <Pencil className="w-4 h-4 mr-1" /> Update
            </Button>
            <Button variant="ghost" onClick={resetForm}>
              <X className="w-4 h-4 mr-1" /> Cancel
            </Button>
          </>
        ) : (
          <Button onClick={() => addService.mutate()}>
            <Plus className="w-4 h-4 mr-1" /> Add Service
          </Button>
        )}
      </div>

      {/* GRID */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-5">
        {services.map((service) => (
          <div
            key={service.id}
            className="group rounded-xl overflow-hidden border bg-card hover:shadow-lg transition"
          >
            {service.image_url && (
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={service.image_url}
                  className="w-full h-full object-cover group-hover:scale-105 transition"
                />
              </div>
            )}

            <div className="p-4 space-y-1">
              <h3 className="font-semibold">{service.title}</h3>
              <p className="text-sm text-primary">{service.price}</p>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {service.description}
              </p>
            </div>

            <div className="flex justify-between px-4 pb-4">
              <button onClick={() => startEdit(service)}>
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={() => deleteService.mutate(service.id)}>
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServicesManager;