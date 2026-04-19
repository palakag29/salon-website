import { MapPin } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const MapSection = () => {
  const scrollRef = useScrollAnimation();
  const address =
    "N-studio 10, Shop no /06, Nityam Square, opp: The Signature Flat, nr. New Water Tank, BSNL Colony, Harni, Vadodara, Gujarat 390024";
  const encodedAddress = encodeURIComponent(address);

  return (
    <section className="py-24 relative section-white" ref={scrollRef}>
      <div className="container">
        <div className="text-center mb-12 space-y-4 animate-on-scroll">
          <p className="text-primary tracking-widest uppercase text-sm font-semibold">
            Find Us
          </p>
          <h2 className="text-4xl md:text-5xl font-display font-bold">
            Our <span className="bg-gradient-to-r from-yellow-600 to-yellow-600 bg-clip-text text-transparent">Location</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-5 gap-6 md:gap-8 items-stretch px-4 animate-on-scroll">
          <div className="lg:col-span-3 rounded-2xl overflow-hidden border border-border/60 h-[280px] sm:h-[350px] lg:h-[400px] shadow-soft">
            <iframe
              title="Mital Soni Makeover & Studio Location"
              src={`https://www.google.com/maps?q=${encodedAddress}&output=embed`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <div className="lg:col-span-2 flex flex-col justify-center p-8 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/60 space-y-6 shadow-soft">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/10 shadow-soft">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-lg mb-2">
                  Mital Soni Makeover & Studio
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Beauty Parlor | Best Make-Up Artist in Vadodara | Bridal
                  Makeup | Hairstyle | Academy | Nail Art | Beauty Parlor
                  Courses
                </p>
              </div>
            </div>
            <div className="border-t border-border/50 pt-4">
              <p className="text-muted-foreground text-sm leading-relaxed">
                Shop No /06, Nityam Square, Opp: The Signature Flat, Nr. New
                Water Tank, BSNL Colony, Harni, Vadodara, Gujarat 390024
              </p>
            </div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:underline transition-colors duration-300"
            >
              Get Directions →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MapSection;
