import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowRight, MessageCircle, Send } from "lucide-react";
import { Link, useLocation, useRoute } from "wouter";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

type Language = "fr" | "en" | "ar";
const copy = {
  fr: { loading: "Ouverture de vos messages…", back: "Retour à mon espace", title: "Messages directs", intro: "Échangez directement avec l’autre partie, posez vos questions et convenez des détails sans intervention de SITUN.", empty: "Aucune conversation pour le moment.", choose: "Sélectionnez une conversation pour commencer.", buyer: "Acheteur / client", provider: "Vendeur / prestataire", message: "Votre message…", send: "Envoyer", sending: "Envoi…", questions: ["Que comprend exactement l’offre ?", "Quel est le délai souhaité ?", "Pouvez-vous proposer un prix selon le besoin ?"], newMessage: "Écrivez votre message", legal: "SITUN facilite la mise en relation. Les utilisateurs négocient librement et restent responsables de leur accord." },
  en: { loading: "Opening your messages…", back: "Back to my workspace", title: "Direct messages", intro: "Talk directly with the other party, ask questions and agree on details without SITUN intervention.", empty: "No conversations yet.", choose: "Select a conversation to begin.", buyer: "Buyer / client", provider: "Seller / provider", message: "Your message…", send: "Send", sending: "Sending…", questions: ["What exactly is included?", "What timing do you need?", "Can you offer a price based on the requirements?"], newMessage: "Write your message", legal: "SITUN facilitates introductions. Users negotiate freely and remain responsible for their agreement." },
  ar: { loading: "جاري فتح رسائلك...", back: "العودة إلى مساحتي", title: "المراسلات المباشرة", intro: "تواصل مباشرة مع الطرف الآخر، اطرح أسئلتك واتفق على التفاصيل دون تدخل SITUN.", empty: "لا توجد محادثات بعد.", choose: "اختر محادثة للبدء.", buyer: "المشتري / العميل", provider: "البائع / مقدم الخدمة", message: "اكتب رسالتك...", send: "إرسال", sending: "جارٍ الإرسال...", questions: ["ماذا يشمل العرض بالتحديد؟", "ما المدة التي تحتاجها؟", "هل يمكن اقتراح سعر حسب المتطلبات؟"], newMessage: "اكتب رسالتك", legal: "يسهّل SITUN التعارف بين الأطراف. يتفاوض المستخدمون بحرية ويتحملون مسؤولية اتفاقهم." },
} as const;

export default function Messages() {
  const language = (window.localStorage.getItem("situn-language") === "en" ? "en" : window.localStorage.getItem("situn-language") === "ar" ? "ar" : "fr") as Language;
  const tx = copy[language];
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [, params] = useRoute("/messages/:id");
  const selectedId = Number(params?.id);
  const conversations = trpc.marketplace.conversations.useQuery(undefined, { enabled: isAuthenticated, refetchInterval: 10000 });
  const messages = trpc.marketplace.conversationMessages.useQuery({ conversationId: selectedId }, { enabled: isAuthenticated && Number.isInteger(selectedId) && selectedId > 0, refetchInterval: 5000 });
  const sendMessage = trpc.marketplace.sendMessage.useMutation({ onSuccess: async () => { setDraft(""); await messages.refetch(); await conversations.refetch(); } });
  const markRead = trpc.marketplace.markConversationRead.useMutation();
  const [draft, setDraft] = useState("");

  useEffect(() => { if (!loading && !isAuthenticated) window.location.href = `/auth?next=${encodeURIComponent(`/messages${selectedId > 0 ? `/${selectedId}` : ""}`)}`; }, [loading, isAuthenticated, selectedId]);
  useEffect(() => { if (selectedId > 0 && messages.data) markRead.mutate({ conversationId: selectedId }); }, [selectedId, messages.data]);

  const selected = useMemo(() => conversations.data?.find(({ conversation }) => conversation.id === selectedId), [conversations.data, selectedId]);
  const conversationTitle = (item: NonNullable<typeof selected>) => item.post?.title ?? item.service?.title ?? (language === "ar" ? "محادثة SITUN" : language === "en" ? "SITUN conversation" : "Conversation SITUN");
  const submit = (event: FormEvent) => { event.preventDefault(); if (!draft.trim() || selectedId <= 0) return; sendMessage.mutate({ conversationId: selectedId, body: draft.trim() }); };
  const sendSuggestion = (suggestion: string) => { if (selectedId > 0) sendMessage.mutate({ conversationId: selectedId, body: suggestion }); };

  if (loading || !isAuthenticated) return <main className="messages-page" lang={language} dir={language === "ar" ? "rtl" : "ltr"}><p>{tx.loading}</p></main>;
  return <main className="messages-page" lang={language} dir={language === "ar" ? "rtl" : "ltr"}>
    <header className="messages-header"><Link href="/workspace" className="profile-back"><ArrowRight size={16} /> {tx.back}</Link><Link href="/" className="services-brand"><span>✦</span> SITUN</Link></header>
    <section className="messages-intro"><p className="services-kicker"><MessageCircle size={15} /> SITUN</p><h1>{tx.title}</h1><p>{tx.intro}</p></section>
    <section className="messages-layout">
      <aside className="conversation-list"><h2>{tx.title}</h2>{conversations.isLoading ? <p>{tx.loading}</p> : conversations.data?.length ? conversations.data.map((item) => <button type="button" key={item.conversation.id} className={`conversation-item ${item.conversation.id === selectedId ? "active" : ""}`} onClick={() => navigate(`/messages/${item.conversation.id}`)}><strong>{conversationTitle(item)}</strong><small>{item.conversation.buyerUserId === user?.id ? tx.provider : tx.buyer}</small></button>) : <p>{tx.empty}</p>}</aside>
      <article className="conversation-panel">{selected ? <><div className="conversation-panel-header"><div><p className="services-kicker">{selected.post ? (language === "ar" ? "منشور" : language === "en" ? "Listing" : "Annonce") : (language === "ar" ? "خدمة" : language === "en" ? "Service" : "Service")}</p><h2>{conversationTitle(selected)}</h2></div><span className="status-pill active">{language === "ar" ? "مفتوحة" : language === "en" ? "Open" : "Ouverte"}</span></div><div className="conversation-messages">{messages.data?.length ? messages.data.map((message) => <div key={message.id} className={`message-bubble ${message.senderUserId === user?.id ? "mine" : "theirs"}`}><p>{message.body}</p><small>{new Date(message.createdAt).toLocaleString(language)}</small></div>) : <p className="conversation-empty">{tx.newMessage}</p>}</div><div className="message-suggestions">{tx.questions.map((suggestion) => <button type="button" key={suggestion} onClick={() => sendSuggestion(suggestion)}>{suggestion}</button>)}</div><form className="message-composer" onSubmit={submit}><textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={3} maxLength={4000} placeholder={tx.message} /><button className="services-gold-button" type="submit" disabled={!draft.trim() || sendMessage.isPending}><Send size={16} /> {sendMessage.isPending ? tx.sending : tx.send}</button></form><p className="conversation-legal">{tx.legal}</p></> : <div className="conversation-empty"><MessageCircle size={32} /><p>{tx.choose}</p></div>}</article>
    </section>
  </main>;
}
