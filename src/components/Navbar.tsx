import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import logo from "@/assets/logo.png";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    if (!isHome) return;
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  return (
    <nav
  className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b 
  ${scrolled 
    ? "bg-black/90 backdrop-blur-md border-white/10 shadow-lg" 
    : "bg-black/90 backdrop-blur-sm border-transparent"
  }`}
>
      <div className="container relative flex items-center justify-between h-16">
        
        <Link to="/" className="flex items-center  z-10">
          <img src={logo} alt="Mital Soni Makeover & Studio" className="w-20 h-20 object-contain" />
          <span className="font-display text-lg -ml-3 font-semibold bg-gradient-to-r from-yellow-500 to-yellow-500 bg-clip-text text-transparent ">Mital Soni Makeover & Studio</span>
        </Link>

        <div className="hidden md:flex absolute inset-0 items-center justify-center pointer-events-none">
          <div className="flex items-center gap-8 pointer-events-auto">
            {isHome ? (
              <>
                <button onClick={() => scrollTo("services")} className="text-sm text-white/90 hover:text-primary transition-colors duration-300">Services</button>
                <button onClick={() => scrollTo("booking")} className="text-sm text-white/90 hover:text-primary transition-colors duration-300">Book Now</button>
              </>
            ) : (
              <Link to="/" className="text-sm text-white/90 hover:text-primary transition-colors duration-300">Home</Link>
            )}
            <Link to="/gallery" className="text-sm text-white/90  hover:text-primary transition-colors duration-300">Gallery</Link>
          </div>
        </div>

        <div className="flex items-center gap-3 z-10">
          {isHome && (
            <Button
              onClick={() => scrollTo("booking")}
              size="sm"
              className="hidden md:inline-flex gold-gradient text-primary-foreground font-body font-semibold rounded-full px-6 hover:opacity-90 transition-all duration-300 btn-glow bg-gradient-to-r from-yellow-500 to-yellow-400 text-black "
            >
              Appointment
            </Button>
          )}
          <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-lg border-b border-border p-4 space-y-3">
          {isHome && (
            <>
              <button onClick={() => scrollTo("services")} className="block w-full text-left text-muted-foreground hover:text-primary">Services</button>
              <button onClick={() => scrollTo("booking")} className="block w-full text-left text-muted-foreground hover:text-primary">Book Now</button>
            </>
          )}
          <Link to="/gallery" onClick={() => setMobileOpen(false)} className="block text-muted-foreground hover:text-primary">Gallery</Link>
          {!isHome && <Link to="/" onClick={() => setMobileOpen(false)} className="block text-muted-foreground hover:text-primary">Home</Link>}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
