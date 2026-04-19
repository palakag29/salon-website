import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { X } from "lucide-react";

const OffersPopup = () => {
  const [open, setOpen] = useState(false);

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

  useEffect(() => {
    if (offers.length > 0) {
      const dismissed = sessionStorage.getItem("offers-dismissed");
      if (!dismissed) setOpen(true);
    }
  }, [offers]);

  const handleClose = () => {
    setOpen(false);
    sessionStorage.setItem("offers-dismissed", "true");
  };

  if (!open || offers.length === 0) return null;

  const offer = offers[0];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/60 backdrop-blur-sm p-4" onClick={handleClose}>
      <div className="relative max-w-md w-full rounded-2xl overflow-hidden border border-primary/30 shadow-2xl animate-in fade-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-background/80 backdrop-blur-sm text-foreground hover:text-primary transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <img
          src={offer.image_url}
          alt={offer.title}
          className="w-full object-cover"
        />
        <div className="p-5 bg-card space-y-2">
          <h3 className="font-display text-xl font-bold gold-text">{offer.title}</h3>
          {offer.description && (
            <p className="text-sm text-muted-foreground">{offer.description}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OffersPopup;
