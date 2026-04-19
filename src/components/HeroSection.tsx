import heroImage from "@/assets/hero-portrait.jpeg";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  const scrollToBooking = () => {
    document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">

      {/* 🔥 Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#f9f6f1] via-white to-[#f8f3ea]" />
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-yellow-400/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-yellow-500/10 rounded-full blur-[100px]" />

      <div className="container relative z-10 grid lg:grid-cols-[0.01fr_1fr_1fr_0.01fr] gap-8 xl:gap-12 items-center py-20 md:py-28 px-4">
        <div></div>
        {/* TEXT */}
        <div className="max-w-none space-y-10 text-center lg:text-left mx-auto lg:mx-0">

          {/* TAG (glass effect) */}
          <div className="inline-block px-5 py-2 rounded-full border border-yellow-500/30 text-xs text-yellow-600 tracking-[0.25em] uppercase backdrop-blur-sm bg-white/40 shadow-md">
            Make-Up · Skin · Hair · Nails & Academy
          </div>

          {/* HEADING */}
          <div className="space-y-4">
            <h1 className="font-display font-semibold leading-[1.05] tracking-tight">
              <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] bg-gradient-to-r from-yellow-600 to-yellow-600 bg-clip-text text-transparent">
                Mital Soni
              </span>
              <span className="block text-foreground text-3xl sm:text-4xl md:text-5xl lg:text-[3.75rem] mt-2">
                Makeover & Studio
              </span>
            </h1>

            {/* GOLD DIVIDER */}
            <div className="w-20 h-[2px] bg-gradient-to-r from-yellow-500 to-yellow-300 mx-auto lg:mx-0" />

            <p className="text-lg sm:text-xl md:text-2xl font-display   tracking-wide text-foreground drop-shadow-md">
  Best Salon and Bridal Makeup Artist in Vadodara
</p>
          </div>

          {/* DESCRIPTION */}
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl  mx-auto lg:mx-0 leading-relaxed tracking-wide">
  Mital Soni Makeover & Studio is a premium beauty salon in Vadodara offering bridal makeup, skin care, hair styling and nail art services.
  <br />
  Located in Harni, we provide professional beauty services trusted by clients across Vadodara.
</p>

          {/* BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">

            {/* PRIMARY */}
            <Button
              onClick={scrollToBooking}
              className="bg-gradient-to-r from-yellow-500 to-yellow-400 text-black font-semibold px-10 py-7 text-base rounded-full transition-all duration-300 shadow-[0_10px_30px_rgba(212,175,55,0.4)] hover:shadow-[0_15px_40px_rgba(212,175,55,0.6)] hover:brightness-110"
            >
              Book Appointment
            </Button>

            {/* SECONDARY */}
            <Button
  variant="outline"
  onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}
  className="relative px-10 py-7 text-base rounded-full border border-yellow-500/40 text-yellow-700 font-medium backdrop-blur-sm bg-white/40 transition-all duration-300 hover:bg-yellow-500/10 hover:border-yellow-500 hover:text-yellow-800 shadow-md hover:shadow-[0_10px_25px_rgba(212,175,55,0.25)]"
>
  Our Services
  <span className="absolute inset-0 rounded-full border border-white/20 pointer-events-none" />
</Button>
          </div>
        </div>

        {/* IMAGE */}
        <div className="relative flex justify-center lg:justify-end mt-4 lg:mt-0 -ml-10">
          <div className="relative w-64 sm:w-72 md:w-80 lg:w-[22rem] group">

            {/* Glow */}
            <div className="absolute -inset-10 rounded-3xl bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 blur-3xl opacity-60 group-hover:opacity-90 transition duration-500" />

            {/* Image */}
            <img
              src={heroImage}
              alt="Mital Soni Makeover & Studio beauty professional"
              className="relative rounded-3xl object-cover w-full aspect-[3/4] shadow-[0_30px_60px_rgba(0,0,0,0.2)] transition-all duration-500  "
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;