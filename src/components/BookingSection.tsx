import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { MessageCircle } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const WHATSAPP_NUMBER = "919879600384";

const serviceOptions = [
  "Facial Care", "Manicure", "Pedicure", "Waxing", "De-Tan", "Hair Spa",
  "Bridal Makeup", "Hair Colour", "Hair Cut & Styling", "Threading",
  "Bleach", "Nail Art", "Party Makeup", "Body Polish", "Eyelash Extensions",
  "Head Massage", "Hair Straightening", "Mehendi", "Skin Treatment", "Saree Draping",
];

const BookingSection = () => {
  const scrollRef = useScrollAnimation();
  const [formData, setFormData] = useState({
    name: "", phone: "", email: "", service: "", date: "", time: "", notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.service || !formData.date || !formData.time) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const serviceName = serviceOptions.find(
      (s) => s.toLowerCase().replace(/\s+/g, "-") === formData.service
    ) || formData.service;

    const message = `New Appointment Booking 💇‍♀️%0A%0A` +
      `*Name:* ${formData.name}%0A` +
      `*Phone:* ${formData.phone}%0A` +
      `*Email:* ${formData.email || "N/A"}%0A` +
      `*Service:* ${serviceName}%0A` +
      `*Date:* ${formData.date}%0A` +
      `*Time:* ${formData.time}%0A` +
      `*Notes:* ${formData.notes || "None"}`;

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");

    toast.success("Redirecting to WhatsApp to confirm your booking!");
    setFormData({ name: "", phone: "", email: "", service: "", date: "", time: "", notes: "" });
  };

  return (
    <section id="booking" className="py-24 relative section-cream" ref={scrollRef}>
      <div className="container relative z-10 max-w-2xl">
        <div className="text-center mb-12 space-y-4 animate-on-scroll">
          <p className="text-primary tracking-widest uppercase text-sm font-semibold">Reserve Your Spot</p>
          <h2 className="text-4xl md:text-5xl font-display font-bold">
            Book an <span className="bg-gradient-to-r from-yellow-600 to-yellow-600 bg-clip-text text-transparent">Appointment</span>
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="animate-on-scroll p-8 md:p-10 rounded-3xl bg-card/80 backdrop-blur-sm border border-border/60 space-y-6 shadow-elevated">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-foreground">Name *</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Your full name" className="bg-secondary/50 border-border focus:border-primary rounded-xl h-12 transition-colors duration-300" />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Phone *</Label>
              <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+91 98765 43210" className="bg-secondary/50 border-border focus:border-primary rounded-xl h-12 transition-colors duration-300" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Email</Label>
            <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="you@email.com" className="bg-secondary/50 border-border focus:border-primary rounded-xl h-12 transition-colors duration-300" />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Service *</Label>
            <Select value={formData.service} onValueChange={(v) => setFormData({ ...formData, service: v })}>
              <SelectTrigger className="bg-secondary/50 border-border rounded-xl h-12">
                <SelectValue placeholder="Choose a service" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border max-h-60">
                {serviceOptions.map((s) => (
                  <SelectItem key={s} value={s.toLowerCase().replace(/\s+/g, "-")}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-foreground">Date *</Label>
              <Input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="bg-secondary/50 border-border focus:border-primary rounded-xl h-12 transition-colors duration-300" />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Time *</Label>
              <Input type="time" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} className="bg-secondary/50 border-border focus:border-primary rounded-xl h-12 transition-colors duration-300" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Additional Notes</Label>
            <Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Any preferences or skin concerns..." className="bg-secondary/50 border-border focus:border-primary rounded-xl min-h-[100px] transition-colors duration-300" />
          </div>

          <Button type="submit" className="w-full gold-gradient text-primary-foreground font-body font-semibold py-6 bg-gradient-to-r from-yellow-500 to-yellow-400 text-black text-base rounded-full hover:opacity-90 transition-all duration-300 btn-glow shadow-gold">
            <MessageCircle className="w-5 h-5 mr-2" />
            Book via WhatsApp
          </Button>
        </form>
      </div>
    </section>
  );
};

export default BookingSection;
