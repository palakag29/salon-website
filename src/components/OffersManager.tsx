import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Trash2, Sparkles, Upload } from "lucide-react";

const OffersManager = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data: offers = [] } = useQuery({
    queryKey: ["admin-offers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("offers")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const addOffer = async () => {
    if (!title.trim() || !endDate || !selectedFile) {
      toast.error("Title, end date, and image are required");
      return;
    }
    setUploading(true);
    try {
      const ext = selectedFile.name.split(".").pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("offers").upload(path, selectedFile);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("offers").getPublicUrl(path);

      const { error } = await supabase.from("offers").insert({
        title: title.trim(),
        description: description.trim() || null,
        image_url: publicUrl,
        storage_path: path,
        start_date: startDate || new Date().toISOString(),
        end_date: new Date(endDate).toISOString(),
        is_active: true,
      });
      if (error) throw error;

      toast.success("Offer added!");
      setTitle("");
      setDescription("");
      setStartDate("");
      setEndDate("");
      setSelectedFile(null);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
      queryClient.invalidateQueries({ queryKey: ["admin-offers"] });
      queryClient.invalidateQueries({ queryKey: ["active-offers"] });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const deleteOffer = useMutation({
    mutationFn: async (offer: { id: string; storage_path: string | null }) => {
      if (offer.storage_path) {
        await supabase.storage.from("offers").remove([offer.storage_path]);
      }
      const { error } = await supabase.from("offers").delete().eq("id", offer.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Offer deleted!");
      queryClient.invalidateQueries({ queryKey: ["admin-offers"] });
      queryClient.invalidateQueries({ queryKey: ["active-offers"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const now = new Date();

  return (
    <div className="space-y-6">

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-foreground text-sm">Title *</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Diwali Special" className="bg-secondary border-border rounded-xl h-10" />
        </div>
        <div className="space-y-2">
          <Label className="text-foreground text-sm">Description</Label>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Flat 20% off on all services" className="bg-secondary border-border rounded-xl h-10" />
        </div>
        <div className="space-y-2">
          <Label className="text-foreground text-sm">Start Date</Label>
          <Input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-secondary border-border rounded-xl h-10" />
        </div>
        <div className="space-y-2">
          <Label className="text-foreground text-sm">End Date *</Label>
          <Input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-secondary border-border rounded-xl h-10" />
        </div>
      </div>

      <div className="flex items-end gap-4">
        <div className="space-y-2">
          <Label className="text-foreground text-sm">Offer Image *</Label>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="rounded-full border-border hover:border-primary">
            <Upload className="w-4 h-4 mr-2" /> {selectedFile ? selectedFile.name : "Choose Image"}
          </Button>
        </div>
        {preview && (
          <img src={preview} alt="Preview" className="w-16 h-16 rounded-lg object-cover border border-border" />
        )}
        <Button onClick={addOffer} disabled={uploading} className="gold-gradient text-primary-foreground rounded-full">
          <Plus className="w-4 h-4 mr-1" /> {uploading ? "Uploading…" : "Add Offer"}
        </Button>
      </div>

      {/* Existing offers */}
      {offers.length > 0 && (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {offers.map((offer) => {
            const isActive = offer.is_active && new Date(offer.start_date) <= now && new Date(offer.end_date) >= now;
            return (
              <div key={offer.id} className="rounded-xl border border-border bg-secondary overflow-hidden">
                <img src={offer.image_url} alt={offer.title} className="w-full aspect-video object-cover" />
                <div className="p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold truncate">{offer.title}</h4>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${isActive ? "bg-green-500/20 text-green-400" : "bg-muted text-muted-foreground"}`}>
                      {isActive ? "Live" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {new Date(offer.start_date).toLocaleDateString()} — {new Date(offer.end_date).toLocaleDateString()}
                  </p>
                  <button
                    onClick={() => deleteOffer.mutate({ id: offer.id, storage_path: offer.storage_path })}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OffersManager;
