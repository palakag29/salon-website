import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, X } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const OffersSection = () => {
  const scrollRef = useScrollAnimation();
  const [viewImage, setViewImage] = useState<string | null>(null);

  const { data: offers = [] } = useQuery({
    queryKey: ["active-offers"],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("offers")
        .select("*")
        .eq("is_active", true)
        .lte("start_date", now)
        .gte("end_date", now)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  if (offers.length === 0) return null;

  return (
    <>
      <section className="py-20 section-cream" ref={scrollRef}>
        <div className="text-center space-y-4 mb-12 px-4 animate-on-scroll">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 text-sm text-primary tracking-widest uppercase shadow-soft">
            <Sparkles className="w-4 h-4" /> Special Offers
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold">
            <span className="bg-gradient-to-r from-yellow-600 to-yellow-600 bg-clip-text text-transparent">Current Offers</span>
          </h2>
        </div>

        <Carousel
          opts={{ align: "start", loop: true }}
          plugins={[Autoplay({ delay: 4000, stopOnInteraction: false })]}
          className="w-full"
        >
          <CarouselContent>
            {offers.map((offer) => (
              <CarouselItem key={offer.id}>
                <div
                  className="w-full overflow-hidden cursor-pointer h-[250px] sm:h-[350px] transition-transform duration-300 hover:scale-[1.01]"
                  onClick={() => setViewImage(offer.image_url)}
                >
                  <img
                    src={offer.image_url}
                    alt={offer.title}
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {offers.length > 1 && (
            <>
              <CarouselPrevious className="left-4" />
              <CarouselNext className="right-4" />
            </>
          )}
        </Carousel>
      </section>

      {viewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setViewImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white"
            onClick={() => setViewImage(null)}
          >
            <X className="w-8 h-8" />
          </button>
          <img
            src={viewImage}
            alt="Offer"
            className="max-w-[90vw] max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};

export default OffersSection;
