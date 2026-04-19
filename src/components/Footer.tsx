import { Phone, MapPin, Clock, Instagram } from "lucide-react";
import logo from "@/assets/logo.png";
import { Link } from "react-router-dom";
const Footer = () => {
  return (
    <footer className="py-16 border-t border-white/10 bg-black">
  <div className="container">
    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-10 px-4">

      {/* LEFT */}
      <div className="space-y-4">
        <div className="flex items-center ">
          <img src={logo} alt="Mital Soni Makeover & Studio" className="w-16 h-16 rounded-full object-cover shadow-soft" />
          <h3 className="font-display font-bold bg-gradient-to-r from-yellow-500 to-yellow-500 bg-clip-text text-transparent text-xl ">
            Mital Soni Makeover & Studio
          </h3>
        </div>

        <p className="text-white/60 leading-relaxed">
          Make-Up · Skin · Hair · Nails & Academy — your destination for premium beauty.
        </p>

        
      </div>

      {/* CONTACT */}
      <div className="space-y-4">
        <h4 className="font-display text-lg font-semibold text-white">Contact</h4>

        <div className="space-y-3 text-white/70">
          <p className="flex items-center gap-3">
            <Phone className="w-4 h-4 text-yellow-400" />
            +91 98796 00384
          </p>

          <p className="flex items-center gap-3">
            <MapPin className="w-4 h-4 text-yellow-400" />
            Shop No /06, Nityam Square, Harni, Vadodara 390024
          </p>

          <p className="flex items-center gap-3">
            <Instagram className="w-4 h-4 text-yellow-400" />
            @mitalsonimakeover
          </p>
        </div>
      </div>

      {/* HOURS */}
      <div className="space-y-4">
        <h4 className="font-display text-lg font-semibold text-white">Hours</h4>

        <div className="space-y-3 text-white/70">
          <p className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-yellow-400" />
            Mon–Sat: 10 AM – 8 PM
          </p>

          <p className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-yellow-400" />
            Sunday: 11 AM – 6 PM
          </p>
        </div>
      </div>
    </div>

    {/* BOTTOM */}
    <div className="mt-12 pt-8 border-t border-white/10 text-center text-white/50 text-sm">
      © 2026 Mital Soni Makeover & Studio. All rights reserved.
    </div>
  </div>
</footer>
  );
};

export default Footer;
