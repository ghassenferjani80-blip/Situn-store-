import { useEffect, useMemo, useState } from "react";
import { buildWhatsAppMessage, calculateBuyerFee, calculateBuyerTotal, calculateCommission, calculateSellerNet, calculateSubtotal, DEFAULT_BUYER_FEE_RATE, DEFAULT_COMMISSION_RATE, SITUN_WHATSAPP, validateCheckout } from "@shared/marketplace";
import { trpc } from "@/lib/trpc";
import {
  ArrowRight,
  ChevronDown,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
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
  image: string;
  accent: string;
};

type CartItem = Product & { quantity: number };
type Language = "fr" | "ar" | "en";

const copy = {
  fr: { navCatalog: "Catalogue", navMaison: "La maison", navSellers: "Vendeurs", cart: "Panier", eyebrow: "L'ART DE CHOISIR AUTREMENT", title: "Tout un monde", titleAccent: "à portée de main.", intro: "SITUN réunit voitures, adresses, mobilier et objets choisis par des vendeurs indépendants. Une marketplace ouverte, élégante et simple à explorer.", cta: "Découvrir la sélection", collection: "LA COLLECTION / 01", curated: "Le choix", curatedAccent: "curaté", search: "Rechercher une pièce...", sellerTitle: "Votre annonce.", sellerAccent: "Notre réseau.", serviceFee: "Frais de service SITUN (2%)", send: "Envoyer sur WhatsApp" },
  ar: { navCatalog: "الكتالوج", navMaison: "عن SITUN", navSellers: "البائعون", cart: "السلة", eyebrow: "فن الاختيار بطريقة مختلفة", title: "عالم كامل", titleAccent: "بين يديك.", intro: "يجمع SITUN السيارات والعقارات والأثاث والمنتجات المختارة من بائعين مستقلين في سوق أنيق وسهل التصفح.", cta: "اكتشف التشكيلة", collection: "التشكيلة / 01", curated: "اختيارات", curatedAccent: "منتقاة", search: "ابحث عن منتج...", sellerTitle: "إعلانك.", sellerAccent: "شبكتنا.", serviceFee: "رسوم خدمة SITUN (2٪)", send: "إرسال عبر WhatsApp" },
  en: { navCatalog: "Catalogue", navMaison: "About SITUN", navSellers: "Sellers", cart: "Cart", eyebrow: "THE ART OF CHOOSING DIFFERENTLY", title: "A whole world", titleAccent: "within reach.", intro: "SITUN brings together cars, real estate, furniture and selected goods from independent sellers in an elegant, open marketplace.", cta: "Discover the selection", collection: "THE COLLECTION / 01", curated: "The", curatedAccent: "curated choice", search: "Search products...", sellerTitle: "Your listing.", sellerAccent: "Our network.", serviceFee: "SITUN service fee (2%)", send: "Send on WhatsApp" },
} as const;

const WHATSAPP = SITUN_WHATSAPP;
const categories = ["Tous", "Immobilier", "Automobile", "Luxe", "Transport", "Mobilier", "Maison", "Mode", "Électronique"];

const products: Product[] = [
  { id: 1, sellerId: 1, name: "Coupé Grand Touring", category: "Automobile", price: 49000, seller: "Garage Héritage", location: "Paris, France", image: "/manus-storage/situn-marketplace-hero_04d4d232.jpg", accent: "black" },
  { id: 2, sellerId: 2, name: "Villa Horizon", category: "Immobilier", price: 780000, seller: "Agence Ligne Claire", location: "Nice, France", image: "/manus-storage/home_2a32ca0b.jpg", accent: "cream" },
  { id: 3, sellerId: 3, name: "Fauteuil Ligne 01", category: "Mobilier", price: 790, seller: "Atelier Serein", location: "Lyon, France", image: "/manus-storage/accessories_3e65735f.jpg", accent: "rose" },
  { id: 4, sellerId: 4, name: "Montre Chrono Orbe", category: "Mode", price: 1890, seller: "Temps Rare", location: "Genève, Suisse", image: "/manus-storage/watch_b3ee929e.jpg", accent: "black" },
  { id: 5, sellerId: 1, name: "Console Minuit", category: "Maison", price: 1350, seller: "Maison N°7", location: "Bruxelles, Belgique", image: "/manus-storage/beauty-clean_bdafaddb.jpg", accent: "gold" },
  { id: 6, sellerId: 2, name: "Système Audio Atelier", category: "Électronique", price: 1290, seller: "Studio Sonore", location: "Marseille, France", image: "/manus-storage/home_2a32ca0b.jpg", accent: "cream" },
  { id: 7, sellerId: 5, name: "Berline Executive", category: "Transport", price: 36500, seller: "Mobilité Signature", location: "Monaco, Monaco", image: "/manus-storage/situn-marketplace-hero_04d4d232.jpg", accent: "black" },
  { id: 8, sellerId: 6, name: "Pièce Héritage", category: "Luxe", price: 4200, seller: "Galerie Rare", location: "Dubai, UAE", image: "/manus-storage/watch_b3ee929e.jpg", accent: "gold" },
];

const money = (value: number) => `${value.toFixed(2).replace(".", ",")} €`;

export default function Home() {
  const [language, setLanguage] = useState<Language>("fr");
  const tx = copy[language];
  useEffect(() => {
    const seo = language === "ar"
      ? { title: "SITUN — سوق العقارات والسيارات والسلع الفاخرة", description: "منصة SITUN للربط بين المشترين والبائعين في العقارات والسيارات والنقل والسلع الفاخرة." }
      : language === "en"
        ? { title: "SITUN — Real estate, automotive and luxury marketplace", description: "SITUN connects buyers and sellers for real estate, cars, transport and luxury goods." }
        : { title: "SITUN — Marketplace immobilier, automobile et luxe", description: "SITUN met en relation acheteurs et vendeurs pour l’immobilier, les voitures, le transport et les biens de luxe." };
    document.title = seo.title;
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

  const filteredProducts = useMemo(() => products.filter((product) => {
    const matchesCategory = activeCategory === "Tous" || product.category === activeCategory;
    const haystack = `${product.name} ${product.seller} ${product.category} ${product.location ?? ""}`.toLowerCase();
    const matchesLocation = haystack.includes(locationQuery.toLowerCase());
    const matchesMin = !minPrice || product.price >= Number(minPrice);
    const matchesMax = !maxPrice || product.price <= Number(maxPrice);
    return matchesCategory && matchesLocation && matchesMin && matchesMax && haystack.includes(query.toLowerCase());
  }), [activeCategory, query, locationQuery, minPrice, maxPrice]);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = calculateSubtotal(cart);

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
        commissionCents: Math.round(calculateCommission(subtotal, DEFAULT_COMMISSION_RATE) * 100),
        commissionRateBps: Math.round(DEFAULT_COMMISSION_RATE * 10000),
        buyerFeeCents: Math.round(calculateBuyerFee(subtotal, DEFAULT_BUYER_FEE_RATE) * 100),
        buyerFeeRateBps: Math.round(DEFAULT_BUYER_FEE_RATE * 10000),
        sellerNetCents: Math.round(calculateSellerNet(subtotal, DEFAULT_COMMISSION_RATE) * 100),
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
      <div className="topline"><span>{language === "ar" ? "اختيارات مستقلة" : language === "en" ? "INDEPENDENT SELECTION" : "LA SÉLECTION INDÉPENDANTE"}</span><span>{language === "ar" ? "منصة دولية" : language === "en" ? "INTERNATIONAL MARKETPLACE" : "MARKETPLACE INTERNATIONALE"}</span><span className="language-switcher">{(["fr", "ar", "en"] as Language[]).map((item) => <button key={item} className={language === item ? "active" : ""} onClick={() => setLanguage(item)}>{item.toUpperCase()}</button>)}</span></div>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="SITUN accueil"><span className="brand-mark">✦</span><span>SITUN</span></a>
        <nav className="main-nav" aria-label="Navigation principale"><a href="#catalogue">{tx.navCatalog}</a><a href="#maison">{tx.navMaison}</a><a href="#vendeurs">{tx.navSellers}</a></nav>
        <button className="cart-trigger" onClick={() => setCartOpen(true)} aria-label="Ouvrir le panier"><ShoppingBag size={20} /><span>{tx.cart}</span>{totalItems > 0 && <b>{totalItems}</b>}</button>
      </header>

      <main id="top"><script type="application/ld+json">{JSON.stringify({ "@context": "https://schema.org", "@type": "ItemList", name: "SITUN marketplace listings", itemListElement: products.map((product, index) => ({ "@type": "ListItem", position: index + 1, name: product.name, category: product.category, offers: { "@type": "Offer", price: product.price, priceCurrency: "EUR", availability: "https://schema.org/InStock" } })) })}</script>
        <section className="hero-section">
          <div className="hero-copy">
            <p className="eyebrow"><Sparkles size={14} /> {tx.eyebrow}</p>
            <h1>{tx.title}<br /><em>{tx.titleAccent}</em></h1>
            <p className="hero-intro">{tx.intro}</p><p className="priority-line">Immobilier · Automobile · Luxe</p>
            <a className="gold-button" href="#catalogue">{tx.cta} <ArrowRight size={17} /></a>
          </div>
          <div className="hero-visual"><div className="hero-arch"><div className="hero-image" /><div className="hero-stamp">S<br />I<br />T<br />U<br />N</div></div><div className="hero-caption">01 / 04 &nbsp; — &nbsp; {language === "ar" ? "اختيارات بعناية" : language === "en" ? "A WORLD CHOSEN WITH INTENTION" : "UN MONDE CHOISI AVEC INTENTION"}</div></div>
        </section>

        <section className="manifesto" id="maison"><span className="ornament">◆</span><p>{language === "ar" ? "نحن نتكفل بالبحث عن المشتري أو البائع المناسب، والتحقق الأولي من الإعلان، وتنسيق التواصل بين الطرفين." : language === "en" ? "We help find the right buyer or seller, review the listing initially, and coordinate the introduction between both parties." : "Nous recherchons l’acheteur ou le vendeur adapté, effectuons une première vérification de l’annonce et coordonnons la mise en relation."}<br /><small>{language === "ar" ? "SITUN تسهّل الوساطة ولا تضمن إتمام الصفقة." : language === "en" ? "SITUN facilitates the introduction but does not guarantee the transaction." : "SITUN facilite la mise en relation sans garantir la conclusion de la transaction."}</small></p><span className="ornament">◆</span></section>

        <section className="catalogue-section" id="catalogue">
          <div className="section-heading"><div><p className="eyebrow">{tx.collection}</p><h2>{tx.curated} <em>{tx.curatedAccent}</em></h2></div><p className="section-note">{language === "ar" ? "اكتشافات لمن يفضّلون الاستثناء على المألوف." : language === "en" ? "Finds for those who prefer the exceptional to the obvious." : "Des trouvailles pour celles et ceux qui préfèrent l'exception à l'évidence."}</p></div>
          <div className="catalogue-tools"><div className="category-tabs">{categories.map((category) => <button className={activeCategory === category ? "active" : ""} key={category} onClick={() => setActiveCategory(category)}>{category}</button>)}</div><div className="search-controls"><label className="search-box"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={tx.search} aria-label={tx.search} /></label><label className="search-box"><input value={locationQuery} onChange={(event) => setLocationQuery(event.target.value)} placeholder={language === "ar" ? "المدينة أو الدولة" : language === "en" ? "City or country" : "Ville ou pays"} aria-label={language === "ar" ? "المدينة أو الدولة" : language === "en" ? "City or country" : "Ville ou pays"} /></label><label className="search-box price-box"><input type="number" min="0" value={minPrice} onChange={(event) => setMinPrice(event.target.value)} placeholder={language === "ar" ? "من €" : language === "en" ? "From €" : "À partir de €"} aria-label={language === "ar" ? "السعر الأدنى" : language === "en" ? "Minimum price" : "Prix minimum"} /></label><label className="search-box price-box"><input type="number" min="0" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} placeholder={language === "ar" ? "إلى €" : language === "en" ? "To €" : "Jusqu’à €"} aria-label={language === "ar" ? "السعر الأقصى" : language === "en" ? "Maximum price" : "Prix maximum"} /></label></div></div>
          <div className="product-grid">{filteredProducts.map((product, index) => <article className="product-card" key={product.id}><div className={`product-image ${product.accent}`}><img src={product.image} alt={product.name} /><span className="product-index">0{index + 1}</span><button className="quick-add" onClick={() => addToCart(product)} aria-label={`Ajouter ${product.name} au panier`}><Plus size={18} /></button></div><div className="product-meta"><div><p className="product-category">{product.category} · {product.seller}</p><h3>{product.name}</h3><small className="product-location">{product.location ?? "International"}</small></div><strong>{money(product.price)}</strong></div>{["Immobilier", "Automobile", "Luxe"].includes(product.category) && <button className="match-button" onClick={() => window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Bonjour SITUN, je souhaite demander une mise en relation pour l’annonce : ${product.name} (${product.category}) auprès de ${product.seller}. Merci de confirmer la provenance, la localisation et les conditions.`)}`, "_blank", "noopener,noreferrer")}>{language === "ar" ? "طلب وساطة" : language === "en" ? "Request introduction" : "Demander une mise en relation"}</button>}</article>)}</div>
          {filteredProducts.length === 0 && <div className="empty-state">Aucune pièce ne correspond à votre recherche.</div>}
        </section>

        <section className="seller-section" id="vendeurs"><div><p className="eyebrow">{language === "ar" ? "للشركات والبائعين" : language === "en" ? "FOR COMPANIES & SELLERS" : "POUR LES ENTREPRISES & VENDEURS"}</p><h2>{tx.sellerTitle}<br /><em>{tx.sellerAccent}</em></h2></div><div className="seller-copy"><p>{language === "ar" ? "هل تعرض سيارة أو عقارًا أو خدمة نقل أو سلعة فاخرة؟ يربط SITUN بين البائعين الموثقين والمشترين الجادين، مع مراجعة كل إعلان وبيان مصدره بوضوح." : language === "en" ? "Do you offer a car, property, transport service or luxury item? SITUN connects verified sellers with serious buyers through reviewed listings with clear provenance." : "Vous proposez une voiture, un bien immobilier, un service de transport ou un article de luxe ? SITUN met en relation les vendeurs vérifiés et les acheteurs sérieux, avec une publication validée et une provenance clairement indiquée."}</p><div className="seller-calculator"><p className="calculator-label">{language === "ar" ? "حاسبة العمولة" : language === "en" ? "COMMISSION CALCULATOR" : "SIMULATEUR DE COMMISSION"}</p><div className="calculator-fields"><label>{language === "ar" ? "سعر البيع" : language === "en" ? "Sale price" : "Prix de vente"}<input type="number" min="0" value={sellerPrice} onChange={(event) => setSellerPrice(event.target.value)} /></label><label>{language === "ar" ? "العمولة ٪" : language === "en" ? "Commission %" : "Commission %"}<input type="number" min="0" max="100" value={sellerRate} onChange={(event) => setSellerRate(event.target.value)} /></label></div><div className="calculator-result"><span>{language === "ar" ? "عمولة SITUN" : language === "en" ? "SITUN commission" : "Commission SITUN"} <strong>{money(calculateCommission(Number(sellerPrice) || 0, (Number(sellerRate) || 0) / 100))}</strong></span><span>{language === "ar" ? "صافي البائع التقديري" : language === "en" ? "Estimated seller net" : "Votre net estimé"} <strong>{money(calculateSellerNet(Number(sellerPrice) || 0, (Number(sellerRate) || 0) / 100))}</strong></span></div></div><button className="outline-button" onClick={() => window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Bonjour SITUN, je souhaite déposer une annonce. Catégorie : immobilier / automobile / transport / luxe. Nom de l’entreprise : ____. Ville et pays : ____. Description : ____. Prix : ____. Source ou preuve de propriété : ____." )}`, "_blank", "noopener,noreferrer")}>{language === "ar" ? "إضافة إعلان" : language === "en" ? "Submit a listing" : "Déposer une annonce"} <ArrowRight size={16} /></button><small>{language === "ar" ? "تتم مراجعة الإعلانات قبل نشرها، ولا تُقبل إلا الإعلانات التي يملك البائع حق نشرها. تُعرض عمولة البائع ورسوم خدمة المشتري بوضوح، وتُسجّل أرباح SITUN يدويًا. لا يخصم الموقع أي أموال تلقائيًا." : language === "en" ? "Listings are reviewed before publication, and only listings the seller is authorized to publish are accepted. Seller commission and buyer service fees are shown clearly, and SITUN revenue is recorded manually. The site does not collect money automatically." : "Les annonces sont examinées avant publication et seules les annonces dont le vendeur autorise la publication sont acceptées. La commission vendeur et les frais acheteur sont affichés clairement, et les revenus SITUN sont enregistrés manuellement. Le site ne prélève aucun paiement automatiquement."}</small></div></section>
      </main>

      <footer className="site-footer"><div className="footer-brand"><span className="brand-mark">✦</span><strong>SITUN</strong><p>La beauté de l'inattendu.</p></div><div><p className="footer-label">SERVICE</p><a href="#catalogue">Catalogue</a><a href="#vendeurs">Vendre avec SITUN</a></div><div><p className="footer-label">COMMANDE</p><p>Paiement à la livraison</p><p>Confirmation par WhatsApp</p></div><div className="footer-seal">SITUN<br /><span>EST. 2026</span></div></footer>

      {cartOpen && <div className="overlay" onClick={() => setCartOpen(false)}><aside className="cart-drawer" onClick={(event) => event.stopPropagation()}><div className="drawer-header"><div><p className="eyebrow">{language === "ar" ? "اختياراتك" : language === "en" ? "YOUR SELECTION" : "VOTRE SÉLECTION"}</p><h2>{language === "ar" ? "السلة" : language === "en" ? "Cart" : "Le panier"} <em>({totalItems})</em></h2></div><button className="icon-button" onClick={() => setCartOpen(false)} aria-label="Fermer"><X /></button></div>{cart.length === 0 ? <div className="cart-empty"><ShoppingBag size={32} /><p>Votre sélection vous attend.</p><button className="outline-button" onClick={() => setCartOpen(false)}>Voir le catalogue</button></div> : <><div className="cart-items">{cart.map((item) => <div className="cart-item" key={item.id}><img src={item.image} alt="" /><div className="cart-item-info"><h3>{item.name}</h3><p>{money(item.price)}</p><div className="quantity"><button onClick={() => changeQuantity(item.id, -1)}><Minus size={13} /></button><span>{item.quantity}</span><button onClick={() => changeQuantity(item.id, 1)}><Plus size={13} /></button></div></div><button className="remove-item" onClick={() => setCart((current) => current.filter((entry) => entry.id !== item.id))} aria-label={`Supprimer ${item.name}`}><Trash2 size={16} /></button></div>)}</div><div className="cart-summary"><div><span>Sous-total</span><strong>{money(subtotal)}</strong></div><small>Paiement à la livraison · frais de livraison confirmés par WhatsApp</small><button className="gold-button full" onClick={() => { setCartOpen(false); setCheckoutOpen(true); }}>Valider la commande <ArrowRight size={17} /></button></div></>}</aside></div>}

      {checkoutOpen && <div className="overlay" onClick={() => setCheckoutOpen(false)}><div className="checkout-modal" onClick={(event) => event.stopPropagation()}><div className="drawer-header"><div><p className="eyebrow">{language === "ar" ? "الخطوة الأخيرة" : language === "en" ? "FINAL STEP" : "DERNIÈRE ÉTAPE"}</p><h2>{language === "ar" ? "تأكيد" : language === "en" ? "Confirm" : "Confirmer"} <em>{language === "ar" ? "الطلب" : language === "en" ? "your order" : "la commande"}</em></h2></div><button className="icon-button" onClick={() => setCheckoutOpen(false)} aria-label="Fermer"><X /></button></div><p className="checkout-lead">{language === "ar" ? "أدخل بياناتك، وسنجهّز ملخصًا في WhatsApp لتأكيد التوصيل والدفع عند الاستلام." : language === "en" ? "Enter your details and we will prepare a WhatsApp summary to confirm delivery and cash on delivery." : "Remplissez vos coordonnées. Un récapitulatif sera préparé dans WhatsApp pour confirmer votre livraison et le paiement à la réception."}</p><div className="checkout-form"><label>Nom complet<input value={customer.name} onChange={(event) => setCustomer({ ...customer, name: event.target.value })} placeholder="Votre nom" /></label><label>Téléphone<input value={customer.phone} onChange={(event) => setCustomer({ ...customer, phone: event.target.value })} placeholder="06 00 00 00 00" /></label><label>Ville et adresse de livraison<textarea value={customer.city} onChange={(event) => setCustomer({ ...customer, city: event.target.value })} placeholder="Votre adresse" rows={2} /></label><label>Note pour le vendeur <span>(facultatif)</span><textarea value={customer.note} onChange={(event) => setCustomer({ ...customer, note: event.target.value })} placeholder="Une précision ?" rows={2} /></label></div>{checkoutError && <p className="checkout-error" role="alert">{checkoutError}</p>}<div className="checkout-total"><span>{language === "ar" ? "المجموع الفرعي" : language === "en" ? "Subtotal" : "Sous-total"}</span><strong>{money(subtotal)}</strong><span>{tx.serviceFee}</span><strong>{money(calculateBuyerFee(subtotal))}</strong><span>{language === "ar" ? "عمولة البائع (10٪)" : language === "en" ? "Seller commission (10%)" : "Commission vendeur (10%)"}</span><strong>{money(calculateCommission(subtotal))}</strong><span>{language === "ar" ? "إيراد SITUN التقديري" : language === "en" ? "Estimated SITUN revenue" : "Revenu SITUN estimé"}</span><strong>{money(calculateCommission(subtotal) + calculateBuyerFee(subtotal))}</strong><span>{language === "ar" ? "الإجمالي التقديري" : language === "en" ? "Estimated total" : "Total estimé"}</span><strong>{money(calculateBuyerTotal(subtotal))}</strong></div><button className="gold-button full" disabled={createOrderMutation.isPending || orderSaved} onClick={createWhatsAppOrder}>{createOrderMutation.isPending ? "Enregistrement..." : orderSaved ? "Commande enregistrée" : "Envoyer sur WhatsApp"} {!createOrderMutation.isPending && !orderSaved && <ArrowRight size={17} />}</button><p className="form-note">{language === "ar" ? "لا يوجد دفع إلكتروني. ستدفع عند الاستلام، وتُتابع عمولة SITUN يدويًا." : language === "en" ? "No online payment. You will pay on delivery; SITUN commission is tracked manually." : "Aucun paiement en ligne. Vous paierez à la livraison ; la commission SITUN est suivie manuellement."}</p></div></div>}
    </div>
  );
}
