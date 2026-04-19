import { Star } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";

interface Review {
  id: string;
  name: string;
  rating: number;
  text: string;
  service: string;
  image_url: string | null;
}

const TestimonialsSection = () => {
  const scrollRef = useScrollAnimation();
  const autoplayPlugin = useRef(Autoplay({ delay: 4000, stopOnInteraction: true }));

  const { data: reviews = [], isLoading } = useQuery<Review[]>({
    queryKey: ["reviews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <section className="py-24 relative section-cream" ref={scrollRef}>
      <div className="container relative z-10">
        <div className="text-center mb-16 space-y-4 animate-on-scroll">
          <p className="text-primary tracking-widest uppercase text-sm font-semibold">
            What Clients Say
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold">
            Client{" "}
            <span className="bg-gradient-to-r from-yellow-600 to-yellow-600 bg-clip-text text-transparent">
              Reviews
            </span>
          </h2>
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-6 rounded-2xl bg-card/80 border border-border/60 space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-center text-muted-foreground">No reviews yet.</p>
        ) : (
          <Carousel
            opts={{ align: "start", loop: true }}
            plugins={[autoplayPlugin.current]}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {reviews.map((review) => (
                <CarouselItem
                  key={review.id}
                  className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
                >
                  <div className="p-6 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/60 card-hover shadow-soft h-full flex flex-col">
                    {/* Profile + Name */}
                    <div className="flex items-center gap-3 mb-4">
                      {review.image_url ? (
                        <img
                          src={review.image_url}
                          alt={review.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                          {review.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <span className="font-display font-semibold text-sm block">
                          {review.name}
                        </span>
                        <span className="text-xs text-primary font-medium">
                          {review.service}
                        </span>
                      </div>
                    </div>

                    {/* Stars */}
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? "fill-primary text-primary"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>

                    {/* Review Text */}
                    <p className="text-foreground/85 text-sm leading-relaxed italic flex-1">
                      "{review.text}"
                    </p>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex -left-4 bg-card/80 border-border hover:bg-primary hover:text-primary-foreground" />
            <CarouselNext className="hidden sm:flex -right-4 bg-card/80 border-border hover:bg-primary hover:text-primary-foreground" />
          </Carousel>
        )}
      </div>
    </section>
  );
};

export default TestimonialsSection;
