import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";
import { LogOut, Plus, Trash2, FolderPlus, Image, Upload, X, Instagram, Sparkles, MessageSquare, Tag, Film } from "lucide-react";
import OffersManager from "@/components/OffersManager";
import ServicesManager from "@/components/ServicesManager";
import ReviewsManager from "@/components/ReviewsManager";
import logo from "@/assets/logo.png";
import heic2any from "heic2any";
import imageCompression from "browser-image-compression";

interface StagedFile {
  file: File;
  preview: string;
  categoryId: string;
  title: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [newCategoryName, setNewCategoryName] = useState("");
  const [defaultCategory, setDefaultCategory] = useState("");
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newReelUrl, setNewReelUrl] = useState("");
  const [newReelTitle, setNewReelTitle] = useState("");

  // Cleanup preview URLs
  useEffect(() => {
    return () => {
      stagedFiles.forEach((f) => URL.revokeObjectURL(f.preview));
    };
  }, []);

  const { data: categories = [] } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("gallery_categories").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: images = [] } = useQuery({
    queryKey: ["admin-images"],
    queryFn: async () => {
      const { data, error } = await supabase.from("gallery_images").select("*, gallery_categories(name)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const addCategory = useMutation({
    mutationFn: async () => {
      if (!newCategoryName.trim()) throw new Error("Name required");
      const slug = newCategoryName.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      const { error } = await supabase.from("gallery_categories").insert({ name: newCategoryName.trim(), slug });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Category added!");
      setNewCategoryName("");
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({ queryKey: ["gallery-categories"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("gallery_categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Category deleted!");
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({ queryKey: ["admin-images"] });
      queryClient.invalidateQueries({ queryKey: ["gallery-categories"] });
    },
    onError: (err: any) => toast.error(err.message),
  });
const updateImageCategory = useMutation({
  mutationFn: async ({ id, categoryId }: { id: string; categoryId: string }) => {
    const { error } = await supabase
      .from("gallery_images")
      .update({ category_id: categoryId })
      .eq("id", id);

    if (error) throw error;
  },
  onSuccess: () => {
    toast.success("Category updated!");
    queryClient.invalidateQueries({ queryKey: ["admin-images"] });
    queryClient.invalidateQueries({ queryKey: ["gallery-images"] });
  },
  onError: (err: any) => toast.error(err.message),
});
  const deleteImage = useMutation({
    mutationFn: async (img: { id: string; storage_path: string | null }) => {
      if (img.storage_path) {
        await supabase.storage.from("gallery").remove([img.storage_path]);
      }
      const { error } = await supabase.from("gallery_images").delete().eq("id", img.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Image deleted!");
      queryClient.invalidateQueries({ queryKey: ["admin-images"] });
      queryClient.invalidateQueries({ queryKey: ["gallery-images"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

 const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (!files || files.length === 0) return;

  if (!defaultCategory) {
    toast.error("Select a default category first.");
    return;
  }

  const newStaged: StagedFile[] = [];

  for (const file of Array.from(files)) {
    let previewUrl = "";

    // 👇 FIX: handle HEIC preview
    if (file.type === "image/heic" || file.name.toLowerCase().endsWith(".heic")) {
  try {
    const processed = await processImage(file);
    previewUrl = URL.createObjectURL(processed);
  } catch {
    previewUrl = "";
  }
} else {
  previewUrl = URL.createObjectURL(file);
}

    newStaged.push({
      file,
      preview: previewUrl,
      categoryId: defaultCategory,
      title: "",
    });
  }

  setStagedFiles((prev) => [...prev, ...newStaged]);
  e.target.value = "";
};

  const updateStagedFile = (index: number, updates: Partial<StagedFile>) => {
    setStagedFiles((prev) => prev.map((f, i) => (i === index ? { ...f, ...updates } : f)));
  };

  const removeStagedFile = (index: number) => {
    setStagedFiles((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleBatchUpload = async () => {
  if (stagedFiles.length === 0) return;

  setUploading(true);
  let successCount = 0;

  try {
    for (const staged of stagedFiles) {
      // ✅ Convert HEIC if needed
      const processedFile = await processImage(staged.file);

      const ext = processedFile.name.split(".").pop();
      const path = `${staged.categoryId}/${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 6)}.${ext}`;

      // ✅ Upload file
      const { error: uploadError } = await supabase.storage
        .from("gallery")
        .upload(path, processedFile);

      if (uploadError) {
        toast.error(`Failed: ${processedFile.name}`);
        continue;
      }

      // ✅ Get public URL
      const { data } = supabase.storage.from("gallery").getPublicUrl(path);

      // ✅ Save to DB
      const { error: dbError } = await supabase
        .from("gallery_images")
        .insert({
          category_id: staged.categoryId,
          title: staged.title || null,
          image_url: data.publicUrl,
          storage_path: path,
        });

      if (dbError) {
        toast.error(`DB error: ${processedFile.name}`);
        continue;
      }

      successCount++;
    }

    toast.success(`${successCount}/${stagedFiles.length} images uploaded!`);

    stagedFiles.forEach((f) => URL.revokeObjectURL(f.preview));
    setStagedFiles([]);

    queryClient.invalidateQueries({ queryKey: ["admin-images"] });
    queryClient.invalidateQueries({ queryKey: ["gallery-images"] });

  } catch (err: any) {
    toast.error(err.message);
  } finally {
    setUploading(false);
  }
};

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin-login");
  };
 
const processImage = async (file: File): Promise<File> => {
  let processed = file;

  // 🔥 STEP 1: HEIC → JPG
  if (
    processed.type === "image/heic" ||
    processed.name.toLowerCase().endsWith(".heic")
  ) {
    try {
      const blob = await heic2any({
        blob: processed,
        toType: "image/jpeg",
        quality: 0.9,
      });

      processed = new File(
        [blob as Blob],
        processed.name.replace(/\.heic$/i, ".jpg"),
        { type: "image/jpeg" }
      );
    } catch (err) {
      console.error("HEIC conversion failed:", err);
    }
  }

  // 🔥 STEP 2: COMPRESS + RESIZE + WEBP
  try {
    const compressed = await imageCompression(processed, {
      maxSizeMB: 0.4,            // 🔥 super optimized
      maxWidthOrHeight: 1600,    // 🔥 Instagram resize
      useWebWorker: true,
      fileType: "image/webp",    // 🔥 BEST format
      initialQuality: 0.8,
    });

    return new File(
      [compressed],
      processed.name.replace(/\.\w+$/, ".webp"),
      { type: "image/webp" }
    );
  } catch (err) {
    console.error("Compression failed:", err);
    return processed;
  }
};

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Mital Soni Makeover & Studio" className="w-8 h-8 rounded-full object-cover" />
            <span className="font-display text-lg font-bold gold-text">Admin Panel</span>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="text-muted-foreground hover:text-primary">
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </header>

      <div className="container py-8">
        <Accordion type="multiple" defaultValue={["categories"]} className="space-y-4">
          {/* Categories */}
          <AccordionItem value="categories" className="rounded-2xl bg-card border border-border px-6">
            <AccordionTrigger className="py-5 hover:no-underline">
              <span className="text-xl font-display font-bold flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-primary" /> Categories
              </span>
            </AccordionTrigger>
            <AccordionContent className="pb-6 space-y-6">
              <div className="flex gap-3">
                <Input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="New category name" className="bg-secondary border-border rounded-xl h-10 max-w-xs" />
                <Button onClick={() => addCategory.mutate()} disabled={addCategory.isPending} size="sm" className="gold-gradient text-primary-foreground rounded-full">
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-3">
                {categories.map((cat) => (
                  <div key={cat.id} className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-secondary">
                    <span className="text-sm font-medium">{cat.name}</span>
                    <button onClick={() => deleteCategory.mutate(cat.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Upload Images */}
          <AccordionItem value="upload-images" className="rounded-2xl bg-card border border-border px-6">
            <AccordionTrigger className="py-5 hover:no-underline">
              <span className="text-xl font-display font-bold flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary" /> Upload Images
              </span>
            </AccordionTrigger>
            <AccordionContent className="pb-6 space-y-6">
              <div className="flex flex-wrap items-end gap-4">
                <div className="space-y-2 min-w-[200px]">
                  <Label className="text-foreground text-sm">Default Category *</Label>
                  <Select value={defaultCategory} onValueChange={setDefaultCategory}>
                    <SelectTrigger className="bg-secondary border-border rounded-xl h-10"><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {categories.map((cat) => (<SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <input ref={fileInputRef} type="file" accept="image/*,.heic" multiple onChange={handleFilesSelected} className="hidden" />
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={!defaultCategory} className="rounded-full border-border hover:border-primary">
                    <Plus className="w-4 h-4 mr-2" /> Select Images
                  </Button>
                </div>
              </div>
              {stagedFiles.length > 0 && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">{stagedFiles.length} image(s) ready to upload</p>
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {stagedFiles.map((staged, index) => (
                      <div key={index} className="relative rounded-xl overflow-hidden border border-border bg-secondary p-2 space-y-2">
                        <div className="relative">
                          <img src={staged.preview} alt={staged.file.name} className="w-full aspect-square object-cover rounded-lg" />
                          <button onClick={() => removeStagedFile(index)} className="absolute top-1 right-1 p-1 rounded-full bg-destructive text-destructive-foreground hover:opacity-80 transition-opacity"><X className="w-3.5 h-3.5" /></button>
                        </div>
                        <Input value={staged.title} onChange={(e) => updateStagedFile(index, { title: e.target.value })} placeholder="Title (optional)" className="bg-background border-border rounded-lg h-8 text-xs" />
                        <Select value={staged.categoryId} onValueChange={(val) => updateStagedFile(index, { categoryId: val })}>
                          <SelectTrigger className="bg-background border-border rounded-lg h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent className="bg-card border-border">
                            {categories.map((cat) => (<SelectItem key={cat.id} value={cat.id} className="text-xs">{cat.name}</SelectItem>))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={handleBatchUpload} disabled={uploading} className="gold-gradient text-primary-foreground rounded-full">
                      <Upload className="w-4 h-4 mr-2" />{uploading ? "Uploading…" : `Upload ${stagedFiles.length} Image(s)`}
                    </Button>
                    <Button variant="ghost" onClick={() => { stagedFiles.forEach((f) => URL.revokeObjectURL(f.preview)); setStagedFiles([]); }} className="text-muted-foreground rounded-full">Clear All</Button>
                  </div>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* All Images */}
          <AccordionItem value="all-images" className="rounded-2xl bg-card border border-border px-6">
            <AccordionTrigger className="py-5 hover:no-underline">
              <span className="text-xl font-display font-bold flex items-center gap-2">
                <Image className="w-5 h-5 text-primary" /> All Images ({images.length})
              </span>
            </AccordionTrigger>
            <AccordionContent className="pb-6">
              {images.length === 0 ? (
                <p className="text-muted-foreground">No images uploaded yet.</p>
              ) : (
                <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {images.map((img) => (
                    <div key={img.id} className="relative rounded-xl overflow-hidden border border-border group">
                      <img src={img.image_url} alt={img.title || "Gallery"} className="w-full aspect-square object-cover" loading="lazy" />
                      <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition flex flex-col justify-center items-center gap-3 p-3">
                        <p className="text-sm font-semibold text-center">{img.title || "Untitled"}</p>
                        <Select value={img.category_id} onValueChange={(value) => updateImageCategory.mutate({ id: img.id, categoryId: value })}>
                          <SelectTrigger className="bg-background border-border rounded-lg h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent className="bg-card border-border">
                            {categories.map((cat) => (<SelectItem key={cat.id} value={cat.id} className="text-xs">{cat.name}</SelectItem>))}
                          </SelectContent>
                        </Select>
                        <Button size="sm" variant="destructive" onClick={() => deleteImage.mutate({ id: img.id, storage_path: img.storage_path })} className="rounded-full">
                          <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Services */}
          <AccordionItem value="services" className="rounded-2xl bg-card border border-border px-6">
            <AccordionTrigger className="py-5 hover:no-underline">
              <span className="text-xl font-display font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" /> Services Management
              </span>
            </AccordionTrigger>
            <AccordionContent className="pb-6">
              <ServicesManager />
            </AccordionContent>
          </AccordionItem>

          {/* Reviews */}
          <AccordionItem value="reviews" className="rounded-2xl bg-card border border-border px-6">
            <AccordionTrigger className="py-5 hover:no-underline">
              <span className="text-xl font-display font-bold flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" /> Reviews Management
              </span>
            </AccordionTrigger>
            <AccordionContent className="pb-6">
              <ReviewsManager />
            </AccordionContent>
          </AccordionItem>

          {/* Offers */}
          <AccordionItem value="offers" className="rounded-2xl bg-card border border-border px-6">
            <AccordionTrigger className="py-5 hover:no-underline">
              <span className="text-xl font-display font-bold flex items-center gap-2">
                <Tag className="w-5 h-5 text-primary" /> Offers
              </span>
            </AccordionTrigger>
            <AccordionContent className="pb-6">
              <OffersManager />
            </AccordionContent>
          </AccordionItem>

          {/* Reels */}
          <AccordionItem value="reels" className="rounded-2xl bg-card border border-border px-6">
            <AccordionTrigger className="py-5 hover:no-underline">
              <span className="text-xl font-display font-bold flex items-center gap-2">
                <Film className="w-5 h-5 text-primary" /> Instagram Reels
              </span>
            </AccordionTrigger>
            <AccordionContent className="pb-6">
              <ReelsManager queryClient={queryClient} newReelUrl={newReelUrl} setNewReelUrl={setNewReelUrl} newReelTitle={newReelTitle} setNewReelTitle={setNewReelTitle} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

// Reels Manager sub-component
const ReelsManager = ({ queryClient, newReelUrl, setNewReelUrl, newReelTitle, setNewReelTitle }: {
  queryClient: any;
  newReelUrl: string;
  setNewReelUrl: (v: string) => void;
  newReelTitle: string;
  setNewReelTitle: (v: string) => void;
}) => {
  const { data: reels = [] } = useQuery({
    queryKey: ["admin-reels"],
    queryFn: async () => {
      const { data, error } = await supabase.from("instagram_reels").select("*").order("display_order");
      if (error) throw error;
      return data;
    },
  });

  const addReel = useMutation({
    mutationFn: async () => {
      if (!newReelUrl.trim()) throw new Error("URL required");
      const { error } = await supabase.from("instagram_reels").insert({
        reel_url: newReelUrl.trim(),
        title: newReelTitle.trim() || null,
        display_order: reels.length,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Reel added!");
      setNewReelUrl("");
      setNewReelTitle("");
      queryClient.invalidateQueries({ queryKey: ["admin-reels"] });
      queryClient.invalidateQueries({ queryKey: ["instagram-reels"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteReel = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("instagram_reels").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Reel removed!");
      queryClient.invalidateQueries({ queryKey: ["admin-reels"] });
      queryClient.invalidateQueries({ queryKey: ["instagram-reels"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-2 flex-1 min-w-[250px]">
          <Label className="text-foreground text-sm">Reel URL *</Label>
          <Input
            value={newReelUrl}
            onChange={(e) => setNewReelUrl(e.target.value)}
            placeholder="https://www.instagram.com/reel/..."
            className="bg-secondary border-border rounded-xl h-10"
          />
        </div>
        <div className="space-y-2 min-w-[180px]">
          <Label className="text-foreground text-sm">Title (optional)</Label>
          <Input
            value={newReelTitle}
            onChange={(e) => setNewReelTitle(e.target.value)}
            placeholder="e.g. Bridal Look"
            className="bg-secondary border-border rounded-xl h-10"
          />
        </div>
        <Button
          onClick={() => addReel.mutate()}
          disabled={addReel.isPending}
          size="sm"
          className="gold-gradient text-primary-foreground rounded-full"
        >
          <Plus className="w-4 h-4 mr-1" /> Add Reel
        </Button>
      </div>

      {reels.length > 0 && (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {reels.map((reel) => (
            <div key={reel.id} className="rounded-xl border border-border bg-secondary p-3 space-y-2">
              <div className="aspect-[9/16] w-full rounded-lg overflow-hidden bg-muted">
                <iframe
                  src={`${reel.reel_url.split("?")[0].replace(/\/$/, "")}/embed`}
                  className="w-full h-full border-0"
                  loading="lazy"
                  title={reel.title || "Reel"}
                />
              </div>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground truncate flex-1">
                  {reel.title || "Untitled"}
                </p>
                <button
                  onClick={() => deleteReel.mutate(reel.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Admin;
