import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

export default function InboxNotifications() {
  const { isAuthenticated } = useAuth();
  const language = window.localStorage.getItem("situn-language") === "en" ? "en" : window.localStorage.getItem("situn-language") === "ar" ? "ar" : "fr";
  const inquiries = trpc.marketplace.myInquiries.useQuery(undefined, { enabled: isAuthenticated, refetchInterval: 10000 });
  const serviceRequests = trpc.marketplace.myServiceRequests.useQuery(undefined, { enabled: isAuthenticated, refetchInterval: 10000 });
  const seenInquiryIds = useRef<Set<number> | null>(null);
  const seenServiceRequestIds = useRef<Set<number> | null>(null);

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

  return null;
}
