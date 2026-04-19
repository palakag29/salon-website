import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_DATA: FaqItem[] = [
  {
    question: "What services do you offer?",
    answer: "We offer a wide range of beauty services including bridal makeup, hair styling, hair smoothing, hair color, facials, skin treatments, manicure, pedicure, waxing, threading, nail art, and more!",
  },
  {
    question: "What are your working hours?",
    answer: "We are open Monday to Sunday, 10:00 AM to 8:00 PM. For bridal bookings, we accommodate early morning appointments as well.",
  },
  {
    question: "How can I book an appointment?",
    answer: "You can book an appointment by calling us at 9879600384, or use the booking section on our website. Walk-ins are also welcome!",
  },
  {
    question: "Where is Mital Soni Makeover & Studio located?",
    answer: "Please check the map section on our homepage for our exact location and directions.",
  },
  {
    question: "Do you offer bridal packages?",
    answer: "Yes! We have comprehensive bridal packages including makeup, hairstyling, saree draping, mehendi, and more. Contact us for custom package pricing.",
  },
  {
    question: "What are your prices?",
    answer: "Prices vary by service. Hair smoothing starts at ₹2500, hair straightening at ₹2500, and hair botox at ₹3500 for medium length. Contact us for a full price list!",
  },
];

const FaqChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ text: string; isBot: boolean }[]>([
    { text: "Hi! 👋 Welcome to Mital Soni Makeover & Studio. How can I help you today? Tap a question below or type your own!", isBot: true },
  ]);
  const [input, setInput] = useState("");

  const handleFaqClick = (faq: FaqItem) => {
    setMessages((prev) => [
      ...prev,
      { text: faq.question, isBot: false },
      { text: faq.answer, isBot: true },
    ]);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input.trim().toLowerCase();
    setMessages((prev) => [...prev, { text: input.trim(), isBot: false }]);
    setInput("");

    // Simple keyword matching
    const match = FAQ_DATA.find((faq) => {
      const keywords = faq.question.toLowerCase().split(" ");
      return keywords.some((kw) => kw.length > 3 && userMsg.includes(kw));
    });

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          text: match
            ? match.answer
            : "I'm not sure about that. Please call us at 9879600384 or visit the booking section for more help!",
          isBot: true,
        },
      ]);
    }, 500);
  };

  // Show only FAQs not yet asked
  const askedQuestions = messages.filter((m) => !m.isBot).map((m) => m.text);
  const availableFaqs = FAQ_DATA.filter((f) => !askedQuestions.includes(f.question));

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full gold-gradient text-primary-foreground shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 left-4 sm:left-auto sm:right-6 z-50 sm:w-[340px] max-h-[70vh] sm:max-h-[480px] rounded-2xl border border-border bg-card shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300">
          {/* Header */}
          <div className="px-4 py-3 gold-gradient text-primary-foreground font-display font-bold text-sm flex items-center gap-2">
            <MessageCircle className="w-4 h-4" /> Mital Soni Help
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[300px]">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.isBot ? "justify-start" : "justify-end"}`}>
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${
                    msg.isBot
                      ? "bg-secondary text-foreground rounded-bl-sm"
                      : "gold-gradient text-primary-foreground rounded-br-sm"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Quick FAQ buttons */}
            {availableFaqs.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {availableFaqs.slice(0, 3).map((faq, i) => (
                  <button
                    key={i}
                    onClick={() => handleFaqClick(faq)}
                    className="text-xs px-3 py-1.5 rounded-full border border-primary/30 text-primary hover:bg-primary/10 transition-colors text-left"
                  >
                    {faq.question}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type a question..."
              className="flex-1 bg-secondary text-foreground text-sm px-3 py-2 rounded-xl border border-border focus:outline-none focus:border-primary/50"
            />
            <Button
              size="sm"
              onClick={handleSend}
              className="gold-gradient text-primary-foreground rounded-full px-3"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default FaqChatbot;
