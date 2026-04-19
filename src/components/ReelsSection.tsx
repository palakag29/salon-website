import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Instagram } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const ReelsSection = () => {
  const scrollRef = useScrollAnimation();
  const { data: reels = [] } = useQuery({
    queryKey: ["instagram-reels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("instagram_reels")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const getEmbedUrl = (url: string) => {
    let cleanUrl = url.split("?")[0].replace(/\/$/, "");
    if (!cleanUrl.endsWith("/embed")) {
      cleanUrl += "/embed";
    }
    return cleanUrl;
  };

  if (reels.length === 0) return null;

  return (
    <section className="py-20 section-white" ref={scrollRef}>
      <div className="container">
        <div className="text-center mb-12 animate-on-scroll">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Instagram className="w-6 h-6 text-primary" />
            <h2 className="text-3xl md:text-4xl font-display font-bold bg-gradient-to-r from-yellow-600 to-yellow-600 bg-clip-text text-transparent">
              Instagram Reels
            </h2>
          </div>
          <p className="text-muted-foreground max-w-md mx-auto">
            Watch our latest transformations and behind-the-scenes moments
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto px-4">
          {reels.map((reel, i) => (
            <div
              key={reel.id}
              className="animate-on-scroll rounded-2xl overflow-hidden glass shadow-soft card-hover"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="aspect-[9/16] w-full overflow-hidden relative">
                <iframe
                  src={getEmbedUrl(reel.reel_url)}
                  className="w-[calc(100%+2px)] border-0 absolute -top-[1px] -left-[1px]"
                  style={{ height: 'calc(100% + 160px)' }}
                  allowFullScreen
                  loading="lazy"
                  scrolling="no"
                  title={reel.title || "Instagram Reel"}
                />
              </div>
              {reel.title && (
                <p className="p-3 text-sm font-medium text-center truncate">
                  {reel.title}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReelsSection;
