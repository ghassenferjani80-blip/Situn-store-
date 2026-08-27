import { useEffect, useMemo, useState } from "react";
import { buildWhatsAppMessage, calculateBuyerFee, calculateBuyerTotal, calculateCommission, calculateSellerNet, calculateSubtotal, DEFAULT_BUYER_FEE_RATE, DEFAULT_COMMISSION_RATE, getCategoryFees, SITUN_WHATSAPP, validateCheckout } from "@shared/marketplace";
import { trpc } from "@/lib/trpc";
import { VAUCLUSE_COMMUNES } from "@shared/vaucluse-communes";
import {
  ArrowRight,
  ChevronDown,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  UserCircle,
  BriefcaseBusiness,
  CarFront,
  House,
  Megaphone,
  Trash2,
  X,
} from "lucide-react";

type Product = {
  id: number;
  sellerId: number;
  name: string;
  category: string;
  price: number;
  seller: string;
  location?: string;
  description?: string;
  image: string;
  accent: string;
};

type CartItem = Product & { quantity: number };
type Language = "fr" | "ar" | "en" | "es" | "it" | "de" | "pt" | "tr" | "nl";

type Copy = { navCatalog: string; navMaison: string; navSellers: string; navWork: string; navProfile: string; cart: string; eyebrow: string; title: string; titleAccent: string; intro: string; cta: string; collection: string; curated: string; curatedAccent: string; search: string; sellerTitle: string; sellerAccent: string; serviceFee: string; send: string; localScope: string; localNote: string };

const copy: Record<Language, Copy> = {
  fr: { navCatalog: "Sélection", navMaison: "SITUN", navSellers: "Proposer", navWork: "Espace de travail", navProfile: "Mon profil", cart: "Panier", eyebrow: "UNE MISE EN RELATION CLAIRE", title: "Le bon choix", titleAccent: "commence ici.", intro: "SITUN rassemble services, savoir-faire et annonces autorisées pour faciliter le travail, la promotion, l’achat et la vente dans le monde entier.", cta: "Voir la sélection", collection: "LA SÉLECTION", curated: "Des biens", curatedAccent: "choisis", search: "Rechercher une annonce...", sellerTitle: "Votre savoir-faire.", sellerAccent: "Notre visibilité.", serviceFee: "Frais SITUN, annoncés à l’avance", send: "Écrire sur WhatsApp", localScope: "MONDE ENTIER · TOUS LES PAYS", localNote: "Depuis la France, SITUN facilite les mises en relation entre personnes du monde entier. Recherchez une ville, un pays ou une activité." },
  ar: { navCatalog: "التشكيلة", navMaison: "عن SITUN", navSellers: "أضف عرضًا", navWork: "مساحة العمل", navProfile: "ملفي الشخصي", cart: "السلة", eyebrow: "وساطة واضحة وموثوقة", title: "اختيارك الأفضل", titleAccent: "يبدأ هنا.", intro: "يجمع SITUN الخدمات والمهارات والإعلانات المصرح بها لتسهيل العمل والترويج والشراء والبيع في جميع أنحاء العالم.", cta: "شاهد التشكيلة", collection: "التشكيلة", curated: "عروض", curatedAccent: "مختارة", search: "ابحث عن إعلان...", sellerTitle: "مهارتك.", sellerAccent: "ظهورك.", serviceFee: "رسوم SITUN معلنة مسبقًا", send: "تواصل عبر WhatsApp", localScope: "العالم · جميع الدول", localNote: "من فرنسا إلى العالم، يسهّل SITUN التواصل بين الأشخاص في كل الدول. ابحث عن مدينة أو دولة أو خدمة." },
  en: { navCatalog: "Selection", navMaison: "About SITUN", navSellers: "Propose", navWork: "Workspace", navProfile: "My profile", cart: "Cart", eyebrow: "A CLEAR INTRODUCTION", title: "The right choice", titleAccent: "starts here.", intro: "SITUN brings together services, skills and authorised listings to make work, promotion, buying and selling easier across the world.", cta: "View the selection", collection: "THE SELECTION", curated: "Carefully", curatedAccent: "chosen", search: "Search listings...", sellerTitle: "Your skill.", sellerAccent: "Our reach.", serviceFee: "SITUN fees, shared in advance", send: "Write on WhatsApp", localScope: "WORLDWIDE · ALL COUNTRIES", localNote: "From France to the world, SITUN facilitates introductions between people everywhere. Search for a city, country or service." },
  es: { navCatalog: "Selección", navMaison: "Sobre SITUN", navSellers: "Proponer", navWork: "Espacio de trabajo", navProfile: "Mi perfil", cart: "Carrito", eyebrow: "UNA CONEXIÓN CLARA", title: "La elección correcta", titleAccent: "empieza aquí.", intro: "SITUN reúne servicios, talento y anuncios autorizados para facilitar el trabajo, la promoción, la compra y la venta en todo el mundo.", cta: "Ver la selección", collection: "LA SELECCIÓN", curated: "Bienes", curatedAccent: "elegidos", search: "Buscar un anuncio...", sellerTitle: "Tu talento.", sellerAccent: "Nuestro alcance.", serviceFee: "Tarifas SITUN, comunicadas antes", send: "Escribir por WhatsApp", localScope: "TODO EL MUNDO · TODOS LOS PAÍSES", localNote: "Desde Francia al mundo, SITUN facilita conexiones entre personas. Busca una ciudad, un país o un servicio." },
  it: { navCatalog: "Selezione", navMaison: "SITUN", navSellers: "Proponi", navWork: "Spazio di lavoro", navProfile: "Il mio profilo", cart: "Carrello", eyebrow: "UN CONTATTO CHIARO", title: "La scelta giusta", titleAccent: "inizia qui.", intro: "SITUN riunisce servizi, competenze e annunci autorizzati per facilitare lavoro, promozione, acquisto e vendita nel mondo.", cta: "Vedi la selezione", collection: "LA SELEZIONE", curated: "Beni", curatedAccent: "scelti", search: "Cerca un annuncio...", sellerTitle: "Le tue competenze.", sellerAccent: "La nostra visibilità.", serviceFee: "Costi SITUN, comunicati in anticipo", send: "Scrivi su WhatsApp", localScope: "TUTTO IL MONDO · TUTTI I PAESI", localNote: "Dalla Francia al mondo, SITUN facilita i contatti tra persone ovunque. Cerca una città, un Paese o un servizio." },
  de: { navCatalog: "Auswahl", navMaison: "Über SITUN", navSellers: "Anbieten", navWork: "Arbeitsbereich", navProfile: "Mein Profil", cart: "Warenkorb", eyebrow: "KLARE VERMITTLUNG", title: "Die richtige Wahl", titleAccent: "beginnt hier.", intro: "SITUN verbindet Dienstleistungen, Können und autorisierte Angebote, um Arbeit, Promotion, Kauf und Verkauf weltweit zu erleichtern.", cta: "Auswahl ansehen", collection: "DIE AUSWAHL", curated: "Ausgewählte", curatedAccent: "Angebote", search: "Anzeige suchen...", sellerTitle: "Ihr Können.", sellerAccent: "Unsere Reichweite.", serviceFee: "SITUN-Gebühren, vorher genannt", send: "Über WhatsApp schreiben", localScope: "WELTWEIT · ALLE LÄNDER", localNote: "Von Frankreich in die Welt: SITUN erleichtert Kontakte zwischen Menschen. Suche nach Stadt, Land oder Dienstleistung." },
  pt: { navCatalog: "Seleção", navMaison: "Sobre a SITUN", navSellers: "Propor", navWork: "Espaço de trabalho", navProfile: "Meu perfil", cart: "Carrinho", eyebrow: "UMA CONEXÃO CLARA", title: "A escolha certa", titleAccent: "começa aqui.", intro: "A SITUN reúne serviços, competências e anúncios autorizados para facilitar trabalho, promoção, compra e venda em todo o mundo.", cta: "Ver seleção", collection: "A SELEÇÃO", curated: "Bens", curatedAccent: "escolhidos", search: "Pesquisar anúncio...", sellerTitle: "O seu talento.", sellerAccent: "O nosso alcance.", serviceFee: "Taxas SITUN, comunicadas antes", send: "Escrever no WhatsApp", localScope: "MUNDO INTEIRO · TODOS OS PAÍSES", localNote: "Da França para o mundo, a SITUN facilita contactos entre pessoas. Pesquise uma cidade, país ou serviço." },
  tr: { navCatalog: "Seçki", navMaison: "SITUN Hakkında", navSellers: "Teklif Ver", navWork: "Çalışma alanı", navProfile: "Profilim", cart: "Sepet", eyebrow: "AÇIK BİR BULUŞMA", title: "Doğru seçim", titleAccent: "burada başlar.", intro: "SITUN, dünya genelinde çalışmayı, tanıtımı, alışverişi ve satışı kolaylaştırmak için hizmetleri ve yetkili ilanları bir araya getirir.", cta: "Seçkiyi gör", collection: "SEÇKİ", curated: "Özenle", curatedAccent: "seçildi", search: "İlan ara...", sellerTitle: "Yeteneğiniz.", sellerAccent: "Bizim erişimimiz.", serviceFee: "SITUN ücretleri önceden paylaşılır", send: "WhatsApp'tan yaz", localScope: "DÜNYA ÇAPINDA · TÜM ÜLKELER", localNote: "Fransa'dan dünyaya SITUN, insanları ve hizmetleri buluşturur. Şehir, ülke veya hizmet arayın." },
  nl: { navCatalog: "Selectie", navMaison: "Over SITUN", navSellers: "Aanbieden", navWork: "Werkruimte", navProfile: "Mijn profiel", cart: "Winkelmand", eyebrow: "EEN DUIDELIJKE VERBINDING", title: "De juiste keuze", titleAccent: "begint hier.", intro: "SITUN brengt diensten, vakmanschap en geautoriseerde aanbiedingen samen om werken, promotie, kopen en verkopen wereldwijd eenvoudiger te maken.", cta: "Bekijk de selectie", collection: "DE SELECTIE", curated: "Zorgvuldig", curatedAccent: "gekozen", search: "Zoek een advertentie...", sellerTitle: "Jouw talent.", sellerAccent: "Ons bereik.", serviceFee: "SITUN-kosten vooraf gedeeld", send: "Schrijf via WhatsApp", localScope: "WERELDWIJD · ALLE LANDEN", localNote: "Vanuit Frankrijk verbindt SITUN mensen wereldwijd. Zoek naar een stad, land of dienst." },
};

const platformCopy: Record<Language, { kicker: string; title: string; accent: string; lead: string; cards: Array<{ label: string; description: string; href: string; icon: typeof ShoppingBag }> }> = {
  fr: { kicker: "UNE PLATEFORME, PLUSIEURS POSSIBILITÉS", title: "Travaillez. Vendez.", accent: "Trouvez votre place.", lead: "SITUN n’est pas seulement une boutique : c’est un espace indépendant pour proposer un service, publier une annonce, trouver une opportunité et acheter ou vendre dans le monde entier.", cards: [{ label: "Acheter & vendre", description: "Produits, mobilier et biens sélectionnés.", href: "/marketplace", icon: ShoppingBag }, { label: "Automobile", description: "Voitures et mobilité à découvrir.", href: "/marketplace", icon: CarFront }, { label: "Immobilier", description: "Annonces et mises en relation.", href: "/marketplace", icon: House }, { label: "Services & freelance", description: "Présentez votre savoir-faire.", href: "/services", icon: BriefcaseBusiness }, { label: "Emploi & opportunités", description: "Trouvez des compétences et des collaborations.", href: "/services", icon: BriefcaseBusiness }, { label: "Promouvoir une offre", description: "Donnez de la visibilité à votre activité.", href: "/promotion", icon: Megaphone }] },
  ar: { kicker: "منصة واحدة · فرص متعددة", title: "اعمل. بع.", accent: "واكتشف مكانك.", lead: "SITUN ليست متجرًا فقط؛ إنها مساحة مستقلة لتقديم خدمة، نشر إعلان، العثور على فرصة، والبيع والشراء من أي دولة.", cards: [{ label: "بيع وشراء", description: "منتجات وأثاث وعروض مختارة.", href: "/marketplace", icon: ShoppingBag }, { label: "السيارات", description: "سيارات وحلول تنقّل حول العالم.", href: "/marketplace", icon: CarFront }, { label: "العقارات", description: "إعلانات وربط مباشر بين الأطراف.", href: "/marketplace", icon: House }, { label: "الخدمات والعمل الحر", description: "اعرض مهارتك وخبرتك.", href: "/services", icon: BriefcaseBusiness }, { label: "فرص العمل", description: "اعثر على أشخاص وفرص تعاون.", href: "/services", icon: BriefcaseBusiness }, { label: "روّج لإعلانك", description: "امنح نشاطك ظهورًا أفضل.", href: "/promotion", icon: Megaphone }] },
  en: { kicker: "ONE PLATFORM · MANY POSSIBILITIES", title: "Work. Sell.", accent: "Find your place.", lead: "SITUN is more than a store: it is an independent space to offer a service, publish a listing, find an opportunity, and buy or sell worldwide.", cards: [{ label: "Buy & sell", description: "Products, furniture and selected goods.", href: "/marketplace", icon: ShoppingBag }, { label: "Cars", description: "Vehicles and mobility worldwide.", href: "/marketplace", icon: CarFront }, { label: "Real estate", description: "Listings and direct introductions.", href: "/marketplace", icon: House }, { label: "Services & freelance", description: "Present your skills and expertise.", href: "/services", icon: BriefcaseBusiness }, { label: "Jobs & opportunities", description: "Find people and collaborations.", href: "/services", icon: BriefcaseBusiness }, { label: "Promote an offer", description: "Give your activity more visibility.", href: "/promotion", icon: Megaphone }] },
  es: { kicker: "UNA PLATAFORMA · MUCHAS POSIBILIDADES", title: "Trabaja. Vende.", accent: "Encuentra tu lugar.", lead: "SITUN es más que una tienda: ofrece servicios, anuncios, oportunidades y compraventa en todo el mundo.", cards: [] },
  it: { kicker: "UNA PIATTAFORMA · MOLTE POSSIBILITÀ", title: "Lavora. Vendi.", accent: "Trova il tuo spazio.", lead: "SITUN è più di un negozio: servizi, annunci, opportunità e compravendita in tutto il mondo.", cards: [] },
  de: { kicker: "EINE PLATTFORM · VIELE MÖGLICHKEITEN", title: "Arbeiten. Verkaufen.", accent: "Finden Sie Ihren Platz.", lead: "SITUN ist mehr als ein Shop: Dienstleistungen, Anzeigen, Chancen und Handel weltweit.", cards: [] },
  pt: { kicker: "UMA PLATAFORMA · MUITAS POSSIBILIDADES", title: "Trabalhe. Venda.", accent: "Encontre o seu espaço.", lead: "A SITUN é mais do que uma loja: serviços, anúncios, oportunidades e comércio em todo o mundo.", cards: [] },
  tr: { kicker: "TEK PLATFORM · BİRDEN ÇOK İMKÂN", title: "Çalışın. Satın.", accent: "Yerini bulun.", lead: "SITUN yalnızca bir mağaza değil; hizmet, ilan, fırsat ve dünya çapında alışveriş alanıdır.", cards: [] },
  nl: { kicker: "ÉÉN PLATFORM · VEEL MOGELIJKHEDEN", title: "Werk. Verkoop.", accent: "Vind jouw plek.", lead: "SITUN is meer dan een winkel: diensten, advertenties, kansen en handel wereldwijd.", cards: [] },
};

const WHATSAPP = SITUN_WHATSAPP;
const categories = ["Tous", "Immobilier", "Automobile", "Luxe", "Transport", "Mobilier", "Maison", "Mode", "Électronique"];
const globalPlaces = ["France", "Tunisie", "Maroc", "Algérie", "Canada", "Belgique", "Suisse", "Monde entier"];
const vaucluseCommunes = VAUCLUSE_COMMUNES.map((commune) => commune.name);

const fallbackProducts: Product[] = [
  { id: 1, sellerId: 1, name: "Coupé Grand Touring", category: "Automobile", price: 49000, seller: "Garage Héritage", location: "Carpentras, Vaucluse", image: "/manus-storage/situn-marketplace-hero_04d4d232.jpg", accent: "black" },
  { id: 2, sellerId: 2, name: "Villa Horizon", category: "Immobilier", price: 780000, seller: "Agence Ligne Claire", location: "Avignon, Vaucluse", image: "/manus-storage/home_2a32ca0b.jpg", accent: "cream" },
  { id: 3, sellerId: 3, name: "Fauteuil Ligne 01", category: "Mobilier", price: 790, seller: "Atelier Serein", location: "L’Isle-sur-la-Sorgue, Vaucluse", image: "/manus-storage/accessories_3e65735f.jpg", accent: "rose" },
  { id: 4, sellerId: 4, name: "Montre Chrono Orbe", category: "Mode", price: 1890, seller: "Temps Rare", location: "Genève, Suisse", image: "/manus-storage/watch_b3ee929e.jpg", accent: "black" },
  { id: 5, sellerId: 1, name: "Console Minuit", category: "Maison", price: 1350, seller: "Maison N°7", location: "Bruxelles, Belgique", image: "/manus-storage/beauty-clean_bdafaddb.jpg", accent: "gold" },
  { id: 6, sellerId: 2, name: "Système Audio Atelier", category: "Électronique", price: 1290, seller: "Studio Sonore", location: "Marseille, France", image: "/manus-storage/home_2a32ca0b.jpg", accent: "cream" },
  { id: 7, sellerId: 5, name: "Berline Executive", category: "Transport", price: 36500, seller: "Mobilité Signature", location: "Monaco, Monaco", image: "/manus-storage/situn-marketplace-hero_04d4d232.jpg", accent: "black" },
  { id: 8, sellerId: 6, name: "Pièce Héritage", category: "Luxe", price: 4200, seller: "Galerie Rare", location: "Dubai, UAE", image: "/manus-storage/watch_b3ee929e.jpg", accent: "gold" },
];

const money = (value: number) => `${value.toFixed(2).replace(".", ",")} €`;

export default function Home() {
  const [language, setLanguage] = useState<Language>(() => { const requested = new URLSearchParams(window.location.search).get("lang") as Language | null; const saved = window.localStorage.getItem("situn-language") as Language | null; return requested && requested in copy ? requested : saved && saved in copy ? saved : "fr"; });
  const tx = copy[language];
  const platform = platformCopy[language];
  useEffect(() => {
    window.localStorage.setItem("situn-language", language);
    const seo = language === "ar"
      ? { title: "SITUN — خدمات وعروض ومنتجات من جميع أنحاء العالم", description: "منصة SITUN تربط الأشخاص حول العالم لتقديم الخدمات والترويج والبيع والشراء بطريقة واضحة." }
      : language === "en"
        ? { title: "SITUN — Global services, listings and marketplace", description: "SITUN connects people worldwide to offer services, promote, buy and sell with clarity." }
        : language === "fr"
          ? { title: "SITUN — Services, annonces et marketplace dans le monde entier", description: "SITUN met en relation les personnes du monde entier pour travailler, promouvoir, acheter et vendre." }
          : { title: `SITUN — ${copy[language].intro.slice(0, 58)}`, description: copy[language].intro };
    document.title = seo.title;
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.querySelector('meta[name="description"]')?.setAttribute("content", seo.description);
  }, [language]);

  const [activeCategory, setActiveCategory] = useState("Tous");
  const [query, setQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [customer, setCustomer] = useState({ name: "", phone: "", city: "", note: "" });
  const [checkoutError, setCheckoutError] = useState("");
  const [sellerPrice, setSellerPrice] = useState("100");
  const [sellerRate, setSellerRate] = useState(String(DEFAULT_COMMISSION_RATE * 100));
  const [orderSaved, setOrderSaved] = useState(false);
  const createOrderMutation = trpc.marketplace.createOrder.useMutation();
  const liveProducts = trpc.marketplace.products.useQuery();
  const catalogueProducts = useMemo<Product[]>(() => {
    if (!liveProducts.data?.length) return fallbackProducts;
    return liveProducts.data.map((product, index) => ({
      id: 100000 + product.id,
      sellerId: product.sellerId,
      name: product.name,
      category: product.category,
      price: product.priceCents / 100,
      seller: "SITUN · annonce validée",
      location: product.location ?? "Vaucluse",
      description: product.description ?? "Annonce validée par SITUN. Contactez-nous pour les informations détaillées.",
      image: product.imageUrl || fallbackProducts[index % fallbackProducts.length].image,
      accent: index % 2 === 0 ? "black" : "cream",
    }));
  }, [liveProducts.data]);

  const filteredProducts = useMemo(() => catalogueProducts.filter((product) => {
    const matchesCategory = activeCategory === "Tous" || product.category === activeCategory;
    const haystack = `${product.name} ${product.seller} ${product.category} ${product.location ?? ""}`.toLowerCase();
    const matchesLocation = haystack.includes(locationQuery.toLowerCase());
    const matchesMin = !minPrice || product.price >= Number(minPrice);
    const matchesMax = !maxPrice || product.price <= Number(maxPrice);
    return matchesCategory && matchesLocation && matchesMin && matchesMax && haystack.includes(query.toLowerCase());
  }), [activeCategory, query, locationQuery, minPrice, maxPrice, catalogueProducts]);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = calculateSubtotal(cart);
  const commission = cart.reduce((sum, item) => sum + calculateCommission(item.price * item.quantity, getCategoryFees(item.category).seller), 0);
  const buyerFee = cart.reduce((sum, item) => sum + calculateBuyerFee(item.price * item.quantity, getCategoryFees(item.category).buyer), 0);

  const addToCart = (product: Product) => {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      return existing
        ? current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
        : [...current, { ...product, quantity: 1 }];
    });
    setCartOpen(true);
  };

  const changeQuantity = (id: number, amount: number) => {
    setCart((current) => current.flatMap((item) => {
      if (item.id !== id) return [item];
      const quantity = item.quantity + amount;
      return quantity > 0 ? [{ ...item, quantity }] : [];
    }));
  };

  const createWhatsAppOrder = async () => {
    const errors = validateCheckout(customer);
    if (Object.keys(errors).length > 0) {
      setCheckoutError(language === "ar" ? "يرجى إكمال الحقول المطلوبة." : language === "en" ? "Please complete the required fields." : Object.values(errors)[0] || "Vérifiez les champs obligatoires.");
      return;
    }
    try {
      await createOrderMutation.mutateAsync({
        customerName: customer.name,
        customerPhone: customer.phone,
        deliveryAddress: customer.city,
        note: customer.note || undefined,
        subtotalCents: Math.round(subtotal * 100),
        commissionCents: Math.round(commission * 100),
        commissionRateBps: Math.round((commission / Math.max(subtotal, 1)) * 10000),
        buyerFeeCents: Math.round(buyerFee * 100),
        buyerFeeRateBps: Math.round((buyerFee / Math.max(subtotal, 1)) * 10000),
        sellerNetCents: Math.round((subtotal - commission) * 100),
        items: cart.map((item) => ({ productId: item.id, sellerId: item.sellerId, productName: item.name, quantity: item.quantity, unitPriceCents: Math.round(item.price * 100), lineTotalCents: Math.round(item.price * item.quantity * 100) })),
      });
      const message = encodeURIComponent(buildWhatsAppMessage(cart, subtotal, customer, language));
      const popup = window.open(`https://wa.me/${WHATSAPP}?text=${message}`, "_blank", "noopener,noreferrer");
      if (!popup) setCheckoutError("La commande est enregistrée, mais WhatsApp n’a pas pu s’ouvrir. Autorisez les fenêtres pop-up puis réessayez.");
      else { setCheckoutError(""); setOrderSaved(true); }
    } catch {
      setCheckoutError("La commande n’a pas pu être enregistrée. Vérifiez votre connexion puis réessayez.");
    }
  };

  return (
    <div className="situn-shell" lang={language} dir={language === "ar" ? "rtl" : "ltr"}>
      <div className="topline"><span>{language === "ar" ? "اختيارات مستقلة · وساطة واضحة" : language === "en" ? "INDEPENDENT SELECTION · CLEAR INTRODUCTION" : "SÉLECTION INDÉPENDANTE · MISE EN RELATION CLAIRE"}</span><span className="language-switcher" aria-label="Choose language">{(["fr", "ar", "en", "es", "it", "de", "pt", "tr", "nl"] as Language[]).map((item) => <button key={item} className={language === item ? "active" : ""} onClick={() => setLanguage(item)} aria-pressed={language === item}>{item.toUpperCase()}</button>)}</span></div>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="SITUN accueil"><span className="brand-mark">✦</span><span>SITUN</span></a>
        <nav className="main-nav" aria-label="Navigation principale"><a href="/services">{language === "ar" ? "الخدمات والعمل" : language === "en" ? "Services & work" : "Services & travail"}</a><a href="/promotion">{language === "ar" ? "الترويج" : language === "en" ? "Promotion" : "Promotion"}</a><a href="/marketplace">{language === "ar" ? "التسوق والشراء" : language === "en" ? "Shop & buy" : "Acheter"}</a><a href="/workspace">{tx.navWork}</a></nav>
        <div className="header-actions"><a className="profile-trigger" href="/workspace" aria-label={tx.navProfile}><UserCircle size={20} /><span>{tx.navProfile}</span></a><button className="cart-trigger" onClick={() => setCartOpen(true)} aria-label="Ouvrir le panier"><ShoppingBag size={20} /><span>{tx.cart}</span>{totalItems > 0 && <b>{totalItems}</b>}</button></div>
      </header>

      <main id="top"><script type="application/ld+json">{JSON.stringify({ "@context": "https://schema.org", "@type": "ItemList", name: "SITUN marketplace listings", itemListElement: catalogueProducts.map((product, index) => ({ "@type": "ListItem", position: index + 1, name: product.name, category: product.category, offers: { "@type": "Offer", price: product.price, priceCurrency: "EUR", availability: "https://schema.org/InStock" } })) })}</script>
        <section className="hero-section">
          <div className="hero-copy">
            <p className="eyebrow"><Sparkles size={14} /> {tx.eyebrow}</p>
            <h1>{tx.title}<br /><em>{tx.titleAccent}</em></h1>
            <p className="hero-intro">{tx.intro}</p><p className="priority-line">{tx.localScope}</p>
            <div className="hero-actions"><a className="gold-button" href="#catalogue">{tx.cta} <ArrowRight size={17} /></a><a className="outline-button hero-secondary" href="/services"><BriefcaseBusiness size={16} />{tx.navSellers}</a></div>
            <div className="path-links"><a href="/services">{language === "ar" ? "أقدّم خدمة" : language === "en" ? "I offer a service" : "Je propose un service"}</a><a href="/promotion">{language === "ar" ? "أروّج لعرض" : language === "en" ? "I promote an offer" : "Je promeus une offre"}</a><a href="/marketplace">{language === "ar" ? "أتسوق وأشتري" : language === "en" ? "I shop and buy" : "J’achète"}</a><a href="/workspace">{language === "ar" ? "أدير عملي" : language === "en" ? "I manage my activity" : "Je gère mon activité"}</a></div>
          </div>
          <div className="hero-visual"><div className="hero-arch"><div className="hero-image" /><div className="hero-stamp">S<br />I<br />T<br />U<br />N</div></div><div className="hero-caption">01 / 04 &nbsp; — &nbsp; {language === "ar" ? "اختيارات بعناية" : language === "en" ? "A WORLD CHOSEN WITH INTENTION" : "UN MONDE CHOISI AVEC INTENTION"}</div></div>
        </section>

        <section className="manifesto" id="maison"><span className="ornament">◆</span><p>{language === "ar" ? "نحن نتكفل بالبحث عن المشتري أو البائع المناسب، والتحقق الأولي من الإعلان، وتنسيق التواصل بين الطرفين." : language === "en" ? "We help find the right buyer or seller, review the listing initially, and coordinate the introduction between both parties." : "Nous recherchons l’acheteur ou le vendeur adapté, effectuons une première vérification de l’annonce et coordonnons la mise en relation."}<br /><small>{language === "ar" ? "SITUN تسهّل الوساطة ولا تضمن إتمام الصفقة." : language === "en" ? "SITUN facilitates the introduction but does not guarantee the transaction." : "SITUN facilite la mise en relation sans garantir la conclusion de la transaction."}</small></p><span className="ornament">◆</span></section>

        <section className="platform-map" aria-labelledby="platform-map-title"><div className="platform-map-heading"><p className="eyebrow">{platform.kicker}</p><h2 id="platform-map-title">{platform.title}<br /><em>{platform.accent}</em></h2><p>{platform.lead}</p></div><div className="platform-map-grid">{platform.cards.length ? platform.cards.map((card) => { const Icon = card.icon; return <a className="platform-route-card" href={card.href} key={card.label}><span className="platform-route-icon"><Icon size={23} /></span><span><strong>{card.label}</strong><small>{card.description}</small></span><ArrowRight className="platform-route-arrow" size={17} /></a>; }) : platformCopy.en.cards.map((card) => { const Icon = card.icon; return <a className="platform-route-card" href={card.href} key={card.label}><span className="platform-route-icon"><Icon size={23} /></span><span><strong>{card.label}</strong><small>{card.description}</small></span><ArrowRight className="platform-route-arrow" size={17} /></a>; })}</div></section>

        <section className="trust-section" id="confiance"><div className="trust-intro"><p className="eyebrow">{language === "ar" ? "الثقة أولًا" : language === "en" ? "TRUST, FIRST" : "LA CONFIANCE, D’ABORD"}</p><h2>{language === "ar" ? "خدمة واضحة." : language === "en" ? "A clear service." : "Un service clair."}<br /><em>{language === "ar" ? "اختيار موثوق." : language === "en" ? "A trusted choice." : "Un choix de confiance."}</em></h2><p>{language === "ar" ? "أنا غسان فرجاني، مؤسس SITUN. أكتب وأسوّق الإعلانات بنفسي، ولا يُنشر أي عرض إلا بإذن صاحبه. SITUN يبيع خدمة الظهور وكتابة الوصف والربط التجاري، وليس المنتجات نفسها." : language === "en" ? "I am Ghassen Ferjani, founder of SITUN. I write and market listings myself, and no offer is published without its owner’s permission. SITUN sells visibility, listing-writing and introduction services—not the goods themselves." : "Je suis Ghassen Ferjani, fondateur de SITUN. Je rédige et présente les annonces moi-même ; aucune offre n’est publiée sans l’autorisation de son propriétaire. SITUN vend un service de visibilité, de rédaction et de mise en relation, pas les biens eux-mêmes."}</p><div className="trust-contact"><a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer">WhatsApp · +33 6 02 25 72 26</a><a href="tel:+33602257226">{language === "ar" ? "اتصال مباشر" : language === "en" ? "Direct call" : "Appel direct"}</a></div></div><div className="trust-steps"><article><span>01</span><h3>{language === "ar" ? "إعلان مصرح" : language === "en" ? "Authorised listing" : "Annonce autorisée"}</h3><p>{language === "ar" ? "نطلب موافقة صاحب العرض قبل النشر ونوضح مصدر المعلومات." : language === "en" ? "We request the owner’s permission before publishing and identify the source of the information." : "Nous demandons l’accord du propriétaire avant publication et indiquons la source des informations."}</p></article><article><span>02</span><h3>{language === "ar" ? "ربط إنساني" : language === "en" ? "Human introduction" : "Mise en relation humaine"}</h3><p>{language === "ar" ? "ننسق الاتصال الأول عبر الهاتف أو WhatsApp، بينما يبقى العقد مع البائع المهني." : language === "en" ? "We coordinate the first contact by phone or WhatsApp; the contract remains with the professional seller." : "Nous coordonnons le premier contact par téléphone ou WhatsApp ; le contrat reste avec le professionnel vendeur."}</p></article><article><span>03</span><h3>{language === "ar" ? "أجر معلن" : language === "en" ? "Declared fee" : "Rémunération annoncée"}</h3><p>{language === "ar" ? "أي أجر خدمة أو عمولة يحدد مسبقًا كتابةً، ولا توجد رسوم مخفية أو خصم آلي." : language === "en" ? "Any service fee or commission is defined in writing beforehand; no hidden fees or automatic deduction." : "Toute rémunération ou commission est définie par écrit à l’avance ; aucun frais caché ni prélèvement automatique."}</p></article></div></section>\n\n        <section className="coverage-strip" aria-label={tx.localScope}><p className="eyebrow">{tx.localScope}</p><p>{tx.localNote}</p><div className="coverage-places">{globalPlaces.map((place) => <button key={place} onClick={() => setLocationQuery(place)}>{place}</button>)}</div></section>

        <section className="catalogue-section" id="catalogue">
          <div className="section-heading"><div><p className="eyebrow">{tx.collection}</p><h2>{tx.curated} <em>{tx.curatedAccent}</em></h2></div><p className="section-note">{language === "ar" ? "اكتشافات لمن يفضّلون الاستثناء على المألوف." : language === "en" ? "Finds for those who prefer the exceptional to the obvious." : "Des trouvailles pour celles et ceux qui préfèrent l'exception à l'évidence."}</p></div>
          <div className="catalogue-tools"><div className="category-tabs">{categories.map((category) => <button className={activeCategory === category ? "active" : ""} key={category} onClick={() => setActiveCategory(category)}>{category}</button>)}</div><div className="search-controls"><label className="search-box"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={tx.search} aria-label={tx.search} /></label><label className="search-box"><input list="global-locations" value={locationQuery} onChange={(event) => setLocationQuery(event.target.value)} placeholder={language === "ar" ? "المدينة أو الإقليم أو الدولة" : language === "en" ? "City, department or country" : "Ville, département ou pays"} aria-label={language === "ar" ? "المدينة أو الإقليم أو الدولة" : language === "en" ? "City, department or country" : "Ville, département ou pays"} /><datalist id="global-locations">{[...globalPlaces, ...vaucluseCommunes].map((place) => <option key={place} value={place} />)}</datalist></label><label className="search-box price-box"><input type="number" min="0" value={minPrice} onChange={(event) => setMinPrice(event.target.value)} placeholder={language === "ar" ? "من €" : language === "en" ? "From €" : "À partir de €"} aria-label={language === "ar" ? "السعر الأدنى" : language === "en" ? "Minimum price" : "Prix minimum"} /></label><label className="search-box price-box"><input type="number" min="0" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} placeholder={language === "ar" ? "إلى €" : language === "en" ? "To €" : "Jusqu’à €"} aria-label={language === "ar" ? "السعر الأقصى" : language === "en" ? "Maximum price" : "Prix maximum"} /></label></div></div>
          <div className="product-grid">{filteredProducts.map((product, index) => <article className="product-card" key={product.id}><div className={`product-image ${product.accent}`}><img src={product.image} alt={product.name} /><span className="product-index">0{index + 1}</span><button className="quick-add" onClick={() => addToCart(product)} aria-label={`Ajouter ${product.name} au panier`}><Plus size={18} /></button></div><div className="product-meta"><div><p className="product-category">{product.category} · {product.seller}</p><h3>{product.name}</h3><small className="product-location">{product.location ?? "International"}</small>{product.description && <p className="product-description">{product.description}</p>}</div><strong>{money(product.price)}</strong></div>{["Immobilier", "Automobile", "Luxe"].includes(product.category) && <><p className="match-fee-note">{language === "ar" ? "الرسوم: يدفعها البائع أو المشتري أو كلاهما فقط باتفاق مكتوب مسبقًا، وتستحق عند المرحلة المتفق عليها." : language === "en" ? "Fees: paid by the seller, buyer or both only under a prior written agreement, and due at the agreed stage." : "Frais : à la charge du vendeur, de l’acheteur ou des deux uniquement selon un accord écrit préalable, dus à l’étape convenue."}</p><button className="match-button" onClick={() => window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Bonjour SITUN, je souhaite demander une mise en relation pour l’annonce : ${product.name} (${product.category}) auprès de ${product.seller}. Merci de confirmer la provenance, la localisation et les conditions.`)}`, "_blank", "noopener,noreferrer")}>{language === "ar" ? "طلب وساطة" : language === "en" ? "Request introduction" : "Demander une mise en relation"}</button></>}</article>)}</div>
          {filteredProducts.length === 0 && <div className="empty-state">Aucune pièce ne correspond à votre recherche.</div>}
        </section>

        <section className="seller-section" id="vendeurs"><div><p className="eyebrow">{language === "ar" ? "للأفراد ومقدمي الخدمات" : language === "en" ? "FOR INDEPENDENT PEOPLE" : "POUR LES INDÉPENDANTS"}</p><h2>{tx.sellerTitle}<br /><em>{tx.sellerAccent}</em></h2></div><div className="seller-copy"><p>{language === "ar" ? "هل تعرض سيارة أو عقارًا أو خدمة نقل أو سلعة فاخرة؟ يربط SITUN بين البائعين الموثقين والمشترين الجادين، مع مراجعة كل إعلان وبيان مصدره بوضوح." : language === "en" ? "Do you offer a car, property, transport service or luxury item? SITUN connects verified sellers with serious buyers through reviewed listings with clear provenance." : "Vous proposez une voiture, un bien immobilier, un service de transport ou un article de luxe ? SITUN met en relation les vendeurs vérifiés et les acheteurs sérieux, avec une publication validée et une provenance clairement indiquée."}</p><div className="seller-calculator"><p className="calculator-label">{language === "ar" ? "حاسبة العمولة" : language === "en" ? "COMMISSION CALCULATOR" : "SIMULATEUR DE COMMISSION"}</p><div className="calculator-fields"><label>{language === "ar" ? "سعر البيع" : language === "en" ? "Sale price" : "Prix de vente"}<input type="number" min="0" value={sellerPrice} onChange={(event) => setSellerPrice(event.target.value)} /></label><label>{language === "ar" ? "العمولة ٪" : language === "en" ? "Commission %" : "Commission %"}<input type="number" min="0" max="100" value={sellerRate} onChange={(event) => setSellerRate(event.target.value)} /></label></div><div className="calculator-result"><span>{language === "ar" ? "عمولة SITUN" : language === "en" ? "SITUN commission" : "Commission SITUN"} <strong>{money(calculateCommission(Number(sellerPrice) || 0, (Number(sellerRate) || 0) / 100))}</strong></span><span>{language === "ar" ? "صافي البائع التقديري" : language === "en" ? "Estimated seller net" : "Votre net estimé"} <strong>{money(calculateSellerNet(Number(sellerPrice) || 0, (Number(sellerRate) || 0) / 100))}</strong></span></div></div><button className="outline-button" onClick={() => window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Bonjour SITUN, je souhaite déposer une annonce. Catégorie : immobilier / automobile / transport / luxe. Nom de l’entreprise : ____. Ville et pays : ____. Description : ____. Prix : ____. Source ou preuve de propriété : ____." )}`, "_blank", "noopener,noreferrer")}>{language === "ar" ? "إضافة إعلان" : language === "en" ? "Submit a listing" : "Déposer une annonce"} <ArrowRight size={16} /></button><small>{language === "ar" ? "تتم مراجعة الإعلانات قبل نشرها، ولا تُقبل إلا الإعلانات التي يملك البائع حق نشرها. تُعرض عمولة البائع ورسوم خدمة المشتري بوضوح، وتُسجّل أرباح SITUN يدويًا. لا يخصم الموقع أي أموال تلقائيًا." : language === "en" ? "Listings are reviewed before publication, and only listings the seller is authorized to publish are accepted. Seller commission and buyer service fees are shown clearly, and SITUN revenue is recorded manually. The site does not collect money automatically." : "Les annonces sont examinées avant publication et seules les annonces dont le vendeur autorise la publication sont acceptées. La commission vendeur et les frais acheteur sont affichés clairement, et les revenus SITUN sont enregistrés manuellement. Le site ne prélève aucun paiement automatiquement."}</small></div></section>
      </main>

      <footer className="site-footer"><div className="footer-brand"><span className="brand-mark">✦</span><strong>SITUN</strong><p>La beauté de l'inattendu.</p><small>Ghassen Ferjani · Fondateur</small></div><div><p className="footer-label">SERVICE</p><a href="#catalogue">Catalogue</a><a href="#vendeurs">Vendre avec SITUN</a><a href="/informations">Informations & confidentialité</a></div><div><p className="footer-label">COMMANDE</p><p>Paiement à la livraison</p><p>Confirmation par WhatsApp</p></div><div className="footer-seal">SITUN<br /><span>EST. 2026</span></div></footer>

      {cartOpen && <div className="overlay" onClick={() => setCartOpen(false)}><aside className="cart-drawer" onClick={(event) => event.stopPropagation()}><div className="drawer-header"><div><p className="eyebrow">{language === "ar" ? "اختياراتك" : language === "en" ? "YOUR SELECTION" : "VOTRE SÉLECTION"}</p><h2>{language === "ar" ? "السلة" : language === "en" ? "Cart" : "Le panier"} <em>({totalItems})</em></h2></div><button className="icon-button" onClick={() => setCartOpen(false)} aria-label="Fermer"><X /></button></div>{cart.length === 0 ? <div className="cart-empty"><ShoppingBag size={32} /><p>Votre sélection vous attend.</p><button className="outline-button" onClick={() => setCartOpen(false)}>Voir le catalogue</button></div> : <><div className="cart-items">{cart.map((item) => <div className="cart-item" key={item.id}><img src={item.image} alt="" /><div className="cart-item-info"><h3>{item.name}</h3><p>{money(item.price)}</p><div className="quantity"><button onClick={() => changeQuantity(item.id, -1)}><Minus size={13} /></button><span>{item.quantity}</span><button onClick={() => changeQuantity(item.id, 1)}><Plus size={13} /></button></div></div><button className="remove-item" onClick={() => setCart((current) => current.filter((entry) => entry.id !== item.id))} aria-label={`Supprimer ${item.name}`}><Trash2 size={16} /></button></div>)}</div><div className="cart-summary"><div><span>Sous-total</span><strong>{money(subtotal)}</strong></div><small>Paiement à la livraison · frais de livraison confirmés par WhatsApp</small><button className="gold-button full" onClick={() => { setCartOpen(false); setCheckoutOpen(true); }}>Valider la commande <ArrowRight size={17} /></button></div></>}</aside></div>}

      {checkoutOpen && <div className="overlay" onClick={() => setCheckoutOpen(false)}><div className="checkout-modal" onClick={(event) => event.stopPropagation()}><div className="drawer-header"><div><p className="eyebrow">{language === "ar" ? "الخطوة الأخيرة" : language === "en" ? "FINAL STEP" : "DERNIÈRE ÉTAPE"}</p><h2>{language === "ar" ? "تأكيد" : language === "en" ? "Confirm" : "Confirmer"} <em>{language === "ar" ? "الطلب" : language === "en" ? "your order" : "la commande"}</em></h2></div><button className="icon-button" onClick={() => setCheckoutOpen(false)} aria-label="Fermer"><X /></button></div><p className="checkout-lead">{language === "ar" ? "أدخل بياناتك، وسنجهّز ملخصًا في WhatsApp لتأكيد التوصيل والدفع عند الاستلام." : language === "en" ? "Enter your details and we will prepare a WhatsApp summary to confirm delivery and cash on delivery." : "Remplissez vos coordonnées. Un récapitulatif sera préparé dans WhatsApp pour confirmer votre livraison et le paiement à la réception."}</p><div className="checkout-form"><label>Nom complet<input value={customer.name} onChange={(event) => setCustomer({ ...customer, name: event.target.value })} placeholder="Votre nom" /></label><label>Téléphone<input value={customer.phone} onChange={(event) => setCustomer({ ...customer, phone: event.target.value })} placeholder="06 00 00 00 00" /></label><label>Ville et adresse de livraison<textarea value={customer.city} onChange={(event) => setCustomer({ ...customer, city: event.target.value })} placeholder="Votre adresse" rows={2} /></label><label>Note pour le vendeur <span>(facultatif)</span><textarea value={customer.note} onChange={(event) => setCustomer({ ...customer, note: event.target.value })} placeholder="Une précision ?" rows={2} /></label></div>{checkoutError && <p className="checkout-error" role="alert">{checkoutError}</p>}<div className="checkout-total"><span>{language === "ar" ? "المجموع الفرعي" : language === "en" ? "Subtotal" : "Sous-total"}</span><strong>{money(subtotal)}</strong><span>{tx.serviceFee}</span><strong>{money(calculateBuyerFee(subtotal))}</strong><span>{language === "ar" ? "عمولة البائع (10٪)" : language === "en" ? "Seller commission (10%)" : "Commission vendeur (10%)"}</span><strong>{money(calculateCommission(subtotal))}</strong><span>{language === "ar" ? "إيراد SITUN التقديري" : language === "en" ? "Estimated SITUN revenue" : "Revenu SITUN estimé"}</span><strong>{money(calculateCommission(subtotal) + calculateBuyerFee(subtotal))}</strong><span>{language === "ar" ? "الإجمالي التقديري" : language === "en" ? "Estimated total" : "Total estimé"}</span><strong>{money(calculateBuyerTotal(subtotal))}</strong></div><button className="gold-button full" disabled={createOrderMutation.isPending || orderSaved} onClick={createWhatsAppOrder}>{createOrderMutation.isPending ? "Enregistrement..." : orderSaved ? "Commande enregistrée" : "Envoyer sur WhatsApp"} {!createOrderMutation.isPending && !orderSaved && <ArrowRight size={17} />}</button><p className="form-note">{language === "ar" ? "لا يوجد دفع إلكتروني. ستدفع عند الاستلام، وتُتابع عمولة SITUN يدويًا." : language === "en" ? "No online payment. You will pay on delivery; SITUN commission is tracked manually." : "Aucun paiement en ligne. Vous paierez à la livraison ; la commission SITUN est suivie manuellement."}</p></div></div>}
    </div>
  );
}
