import { MessageCircle } from "lucide-react";
import { SITUN_WHATSAPP } from "@shared/marketplace";

export default function WhatsAppFloat() {
  const language = typeof window !== "undefined" ? window.localStorage.getItem("situn-language") : "fr";
  const message = language === "ar"
    ? "مرحبًا SITUN، أريد مراسلتكم حول نشر عرض أو خدمة أو شراء."
    : language === "en"
      ? "Hello SITUN, I would like to message you about publishing an offer, a service or a purchase."
      : "Bonjour SITUN, je souhaite vous écrire au sujet d’une annonce, d’un service ou d’un achat.";

  return (
    <a
      className="whatsapp-float"
      href={`https://wa.me/${SITUN_WHATSAPP}?text=${encodeURIComponent(message)}`}
      target="_blank"
      rel="noreferrer"
      aria-label="WhatsApp SITUN — envoyer un message"
      title="WhatsApp SITUN — envoyer un message"
    >
      <MessageCircle size={22} strokeWidth={2.4} />
      <span>WhatsApp</span>
    </a>
  );
}
