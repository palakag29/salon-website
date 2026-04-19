import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const ServicesSection = () => {
  const scrollRef = useScrollAnimation();

  // 🔥 FETCH SERVICES FROM SUPABASE
  const { data: services = [], isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    slidesToScroll: 1,
    containScroll: "trimSnaps",
    breakpoints: {
      "(min-width: 640px)": { slidesToScroll: 2 },
      "(min-width: 1024px)": { slidesToScroll: 4 },
    },
  });

  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanPrev(emblaApi.canScrollPrev());
    setCanNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <section id="services" className="py-24 relative section-white" ref={scrollRef}>
      <div className="container relative z-10">

        {/* HEADER */}
        <div className="flex items-end justify-between mb-12 animate-on-scroll">
          <div className="space-y-4">
            <p className="gold-text tracking-widest uppercase text-sm font-semibold">
              What We Offer
            </p>
            <h2 className="text-4xl md:text-5xl font-display font-bold">
              Our{" "}
              <span className="bg-gradient-to-r from-yellow-600 to-yellow-400 bg-clip-text text-transparent">
                Services
              </span>
            </h2>
          </div>

          <div className="hidden sm:flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={() => emblaApi?.scrollPrev()}
              disabled={!canPrev}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={() => emblaApi?.scrollNext()}
              disabled={!canNext}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* LOADING */}
        {isLoading && (
          <p className="text-center text-muted-foreground">Loading services...</p>
        )}

        {/* EMPTY STATE */}
        {!isLoading && services.length === 0 && (
          <p className="text-center text-muted-foreground">
            No services available yet.
          </p>
        )}

        {/* SERVICES SLIDER */}
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex -ml-4">
            {services.map((service: any) => (
              <div
                key={service.id}
                className="min-w-0 shrink-0 grow-0 basis-full sm:basis-1/2 lg:basis-1/4 pl-4"
              >
                <div className="group rounded-2xl bg-card border border-border/80 overflow-hidden transition-all duration-300 hover:shadow-lg h-full flex flex-col">

                  {/* IMAGE */}
                  {service.image_url && (
                    <div className="aspect-[4/3] overflow-hidden">
                      <img
                        src={service.image_url}
                        alt={service.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                    </div>
                  )}

                  {/* CONTENT */}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-display font-semibold">
                        {service.title}
                      </h3>
                      {service.price && (
                        <span className="text-xs font-semibold text-primary">
                          {service.price}
                        </span>
                      )}
                    </div>

                    {service.description && (
                      <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                        {service.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MOBILE BUTTONS */}
        <div className="flex sm:hidden justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => emblaApi?.scrollPrev()}
            disabled={!canPrev}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => emblaApi?.scrollNext()}
            disabled={!canNext}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;