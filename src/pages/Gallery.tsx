import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Gallery = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [viewIndex, setViewIndex] = useState<number | null>(null);

  const { data: categories = [] } = useQuery({
    queryKey: ["gallery-categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("gallery_categories").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: images = [] } = useQuery({
    queryKey: ["gallery-images", activeCategory],
    queryFn: async () => {
      let query = supabase.from("gallery_images").select("*, gallery_categories(name)").order("created_at", { ascending: false });
      if (activeCategory) query = query.eq("category_id", activeCategory);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const showPrev = () => {
    if (viewIndex !== null) setViewIndex((viewIndex - 1 + images.length) % images.length);
  };
  const showNext = () => {
    if (viewIndex !== null) setViewIndex((viewIndex + 1) % images.length);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-24 pb-16">
        <div className="container">
          <div className="text-center mb-12 space-y-4">
            <p className="text-primary tracking-widest uppercase text-sm font-semibold">Our Work</p>
            <h1 className="text-4xl md:text-5xl font-display font-bold">
              <span className="gold-text">Gallery</span>
            </h1>
          </div>

          {/* Category filters */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                !activeCategory
                  ? "gold-gradient text-primary-foreground"
                  : "border border-border text-muted-foreground hover:border-primary/40 hover:text-primary"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                  activeCategory === cat.id
                    ? "gold-gradient text-primary-foreground"
                    : "border border-border text-muted-foreground hover:border-primary/40 hover:text-primary"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Image grid */}
          {images.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <p className="text-lg">No images yet. Check back soon!</p>
            </div>
          ) : (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
              {images.map((img, idx) => (
                <div key={img.id} className="break-inside-avoid rounded-2xl overflow-hidden border border-border hover:border-primary/40 transition-all group cursor-pointer" onClick={() => setViewIndex(idx)}>
                  <img
                    src={img.image_url}
                    alt={img.title || "Gallery image"}
                    className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  {img.title && (
                    <div className="p-3 bg-card">
                      <p className="text-sm font-semibold">{img.title}</p>
                      <p className="text-xs text-muted-foreground">{(img as any).gallery_categories?.name}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />

      {viewIndex !== null && images[viewIndex] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setViewIndex(null)}
        >
          <button
            className="absolute top-4 right-4 text-foreground/80 hover:text-foreground z-10"
            onClick={() => setViewIndex(null)}
          >
            <X className="w-8 h-8" />
          </button>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/70 hover:text-foreground z-10"
            onClick={(e) => { e.stopPropagation(); showPrev(); }}
          >
            <ChevronLeft className="w-10 h-10" />
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/70 hover:text-foreground z-10"
            onClick={(e) => { e.stopPropagation(); showNext(); }}
          >
            <ChevronRight className="w-10 h-10" />
          </button>
          <img
            src={images[viewIndex].image_url}
            alt="Gallery"
            className="max-w-[90vw] max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default Gallery;