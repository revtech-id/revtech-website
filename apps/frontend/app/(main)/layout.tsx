import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatbotUI from "@/components/ChatbotUI";
import WhatsAppFAB from "@/components/ui/WhatsAppFAB";
import SmoothScroll from "@/components/SmoothScroll";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-[100svh] pt-20">
      <SmoothScroll>
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
        <WhatsAppFAB />
        <ChatbotUI />
      </SmoothScroll>
    </div>
  );
}
