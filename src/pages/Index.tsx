import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import OffersSection from "@/components/OffersSection";
import ServicesSection from "@/components/ServicesSection";
import ReelsSection from "@/components/ReelsSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import BookingSection from "@/components/BookingSection";
import MapSection from "@/components/MapSection";
import Footer from "@/components/Footer";
import OffersPopup from "@/components/OffersPopup";
import FaqChatbot from "@/components/FaqChatbot";

const GoldDivider = () => <div className="gold-divider mx-auto w-full max-w-4xl" />;

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative z-10">
      <Navbar />
      <HeroSection />
      <GoldDivider />
      <OffersSection />
      <GoldDivider />
      <ServicesSection />
      <GoldDivider />
      <ReelsSection />
      <GoldDivider />
      <TestimonialsSection />
      <GoldDivider />
      <BookingSection />
      <GoldDivider />
      <MapSection />
      <GoldDivider />
      <Footer />
      <OffersPopup />
      <FaqChatbot />
    </div>
  );
};

export default Index;
