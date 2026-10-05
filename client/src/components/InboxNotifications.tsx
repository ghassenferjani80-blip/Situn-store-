import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { MessageCircle } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

export default function InboxNotifications() {
  const { isAuthenticated } = useAuth();
  const language = window.localStorage.getItem("situn-language") === "en" ? "en" : window.localStorage.getItem("situn-language") === "ar" ? "ar" : "fr";
  const inquiries = trpc.marketplace.myInquiries.useQuery(undefined, { enabled: isAuthenticated, refetchInterval: 10000 });
  const serviceRequests = trpc.marketplace.myServiceRequests.useQuery(undefined, { enabled: isAuthenticated, refetchInterval: 10000 });
  const unreadMessages = trpc.marketplace.unreadMessageCount.useQuery(undefined, { enabled: isAuthenticated, refetchInterval: 5000 });
  const seenInquiryIds = useRef<Set<number> | null>(null);
  const seenServiceRequestIds = useRef<Set<number> | null>(null);
  const previousUnread = useRef<number | null>(null);

  useEffect(() => {
    if (!inquiries.data) return;
    const ids = new Set(inquiries.data.map(({ inquiry }) => inquiry.id));
    if (seenInquiryIds.current) {
      inquiries.data
        .filter(({ inquiry }) => !seenInquiryIds.current?.has(inquiry.id) && inquiry.status === "new")
        .slice(0, 3)
        .forEach(({ inquiry, post }) => toast.info(
          language === "ar" ? "رسالة جديدة من مشترٍ" : language === "en" ? "New message from a buyer" : "Nouveau message d’un acheteur",
          { description: `${inquiry.requesterName} · ${post?.title ?? (language === "ar" ? "منشور" : language === "en" ? "Listing" : "Annonce")}` },
        ));
    }
    seenInquiryIds.current = ids;
  }, [inquiries.data, language]);

  useEffect(() => {
    if (!serviceRequests.data) return;
    const ids = new Set(serviceRequests.data.map(({ request }) => request.id));
    if (seenServiceRequestIds.current) {
      serviceRequests.data
        .filter(({ request }) => !seenServiceRequestIds.current?.has(request.id) && request.status === "received")
        .slice(0, 3)
        .forEach(({ request, service }) => toast.info(
          language === "ar" ? "طلب خدمة جديد" : language === "en" ? "New service request" : "Nouvelle demande de service",
          { description: `${request.buyerName} · ${service?.title ?? (language === "ar" ? "خدمة" : language === "en" ? "Service" : "Service")}` },
        ));
    }
    seenServiceRequestIds.current = ids;
  }, [serviceRequests.data, language]);

  useEffect(() => {
    if (typeof unreadMessages.data !== "number") return;
    if (previousUnread.current !== null && unreadMessages.data > previousUnread.current) {
      toast.info(language === "ar" ? "لديك رسالة جديدة" : language === "en" ? "You have a new message" : "Vous avez un nouveau message", {
        description: language === "ar" ? "افتح مركز الرسائل للرد والتفاوض." : language === "en" ? "Open messages to reply and negotiate." : "Ouvrez vos messages pour répondre et négocier.",
      });
    }
    previousUnread.current = unreadMessages.data;
  }, [unreadMessages.data, language]);

  if (!isAuthenticated || !unreadMessages.data) return null;
  return <Link href="/messages" className="unread-messages-badge" aria-label={`${unreadMessages.data} unread messages`}><MessageCircle size={16} /> <span>{language === "ar" ? "الرسائل" : language === "en" ? "Messages" : "Messages"}</span><b>{unreadMessages.data}</b></Link>;
}
