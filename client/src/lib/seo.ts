const SITE_URL = "https://situnshop-b3hmcevz.manus.space";
const DEFAULT_IMAGE = `${SITE_URL}/manus-storage/situn-marketplace-hero_04d4d232.jpg`;

export type SeoLanguage = "ar" | "fr" | "en";

type SeoInput = { title: string; description: string; path?: string; type?: "website" | "article"; language?: SeoLanguage; image?: string };

export function applySeo({ title, description, path = "/", type = "website", language = "en", image = DEFAULT_IMAGE }: SeoInput) {
  document.title = title;
  document.documentElement.lang = language;
  document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  const canonical = new URL(path, SITE_URL).toString();
  const setMeta = (selector: string, content: string) => document.querySelector(selector)?.setAttribute("content", content);
  setMeta('meta[name="description"]', description);
  setMeta('meta[property="og:title"]', title);
  setMeta('meta[property="og:description"]', description);
  setMeta('meta[property="og:url"]', canonical);
  setMeta('meta[property="og:type"]', type);
  setMeta('meta[property="og:image"]', image);
  setMeta('meta[name="twitter:title"]', title);
  setMeta('meta[name="twitter:description"]', description);
  setMeta('meta[name="twitter:image"]', image);
  document.querySelector('link[rel="canonical"]')?.setAttribute("href", canonical);
}

export const SITE_SEO = {
  ar: { title: "SITUN — اشترِ، بِع، اعمل وطوّر نشاطك مع العالم", description: "SITUN منصة عالمية لشراء وبيع المنتجات، واكتشاف الخدمات، والبحث عن الوظائف وفرص العمل عبر الإنترنت، ونشر العروض والتواصل مع الأشخاص والمهنيين حول العالم." },
  fr: { title: "SITUN — Achetez, vendez, travaillez et développez votre activité dans le monde entier.", description: "SITUN est une marketplace mondiale pour acheter et vendre des produits, découvrir des services, trouver un emploi ou une activité en ligne, publier une offre et échanger avec des personnes et des professionnels partout dans le monde." },
  en: { title: "SITUN | Buy, Sell, Work & Services Worldwide", description: "SITUN is a global marketplace for buying and selling products, finding services, jobs and online work opportunities, and connecting people and businesses worldwide." },
} satisfies Record<SeoLanguage, { title: string; description: string }>;

export const SECTION_SEO = {
  marketplace: { en: { title: "SITUN Marketplace | Buy & Sell Worldwide", description: "Buy and sell products, vehicles, real estate and classified offers through SITUN worldwide." }, fr: { title: "SITUN Marketplace | Acheter et vendre partout dans le monde", description: "Achetez et vendez des produits, véhicules, biens immobiliers et annonces avec SITUN dans le monde entier." }, ar: { title: "سوق SITUN | بيع وشراء من جميع أنحاء العالم", description: "اشترِ وبِع المنتجات والسيارات والعقارات والإعلانات عبر منصة SITUN العالمية." } },
  services: { en: { title: "SITUN Services & Freelance Work Worldwide", description: "Discover services, offer your skills and connect with customers and professionals worldwide on SITUN." }, fr: { title: "SITUN Services et freelance dans le monde entier", description: "Découvrez des services, proposez vos compétences et échangez avec des clients et professionnels partout dans le monde." }, ar: { title: "خدمات وعمل حر عبر العالم | SITUN", description: "اكتشف الخدمات، اعرض مهاراتك وتواصل مع العملاء والمهنيين حول العالم عبر SITUN." } },
  promotion: { en: { title: "SITUN Promotion | Give Your Offer More Visibility", description: "Promote a product, service, job or classified offer and connect with interested people worldwide." }, fr: { title: "SITUN Promotion | Donnez de la visibilité à votre offre", description: "Faites connaître un produit, un service, un emploi ou une annonce et échangez avec des personnes partout dans le monde." }, ar: { title: "الترويج عبر SITUN | امنح عرضك ظهورًا أفضل", description: "روّج لمنتج أو خدمة أو وظيفة أو إعلان وتواصل مع المهتمين من جميع أنحاء العالم." } },
} as const;
