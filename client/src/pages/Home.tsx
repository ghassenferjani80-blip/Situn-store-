import { useMemo, useState } from "react";
import { buildWhatsAppMessage, calculateCommission, calculateSellerNet, calculateSubtotal, DEFAULT_COMMISSION_RATE, SITUN_WHATSAPP, validateCheckout } from "@shared/marketplace";
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
  image: string;
  accent: string;
};

type CartItem = Product & { quantity: number };

const WHATSAPP = SITUN_WHATSAPP;
const categories = ["Tous", "Beauté", "Maison", "Accessoires", "Éditions"];

const products: Product[] = [
  { id: 1, sellerId: 1, name: "Noir Élixir", category: "Beauté", price: 49, seller: "Maison N°7", image: "/manus-storage/beauty-clean_bdafaddb.jpg", accent: "gold" },
  { id: 2, sellerId: 2, name: "Salon Lumière", category: "Maison", price: 129, seller: "Atelier Serein", image: "/manus-storage/home_2a32ca0b.jpg", accent: "cream" },
  { id: 3, sellerId: 3, name: "Ligne Héritage", category: "Accessoires", price: 79, seller: "Éclat Paris", image: "/manus-storage/accessories_3e65735f.jpg", accent: "rose" },
  { id: 4, sellerId: 4, name: "Chrono Orbe", category: "Accessoires", price: 189, seller: "Temps Rare", image: "/manus-storage/watch_b3ee929e.jpg", accent: "black" },
  { id: 5, sellerId: 1, name: "Bougie Minuit", category: "Maison", price: 35, seller: "Maison N°7", image: "/manus-storage/beauty-clean_bdafaddb.jpg", accent: "gold" },
  { id: 6, sellerId: 2, name: "Objet Sculpté", category: "Éditions", price: 95, seller: "Atelier Serein", image: "/manus-storage/home_2a32ca0b.jpg", accent: "cream" },
];

const money = (value: number) => `${value.toFixed(2).replace(".", ",")} €`;

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("Tous");
  const [query, setQuery] = useState("");
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
    const haystack = `${product.name} ${product.seller} ${product.category}`.toLowerCase();
    return matchesCategory && haystack.includes(query.toLowerCase());
  }), [activeCategory, query]);

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
      setCheckoutError(Object.values(errors)[0] || "Vérifiez les champs obligatoires.");
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
        sellerNetCents: Math.round(calculateSellerNet(subtotal, DEFAULT_COMMISSION_RATE) * 100),
        items: cart.map((item) => ({ productId: item.id, sellerId: item.sellerId, productName: item.name, quantity: item.quantity, unitPriceCents: Math.round(item.price * 100), lineTotalCents: Math.round(item.price * item.quantity * 100) })),
      });
      const message = encodeURIComponent(buildWhatsAppMessage(cart, subtotal, customer));
      const popup = window.open(`https://wa.me/${WHATSAPP}?text=${message}`, "_blank", "noopener,noreferrer");
      if (!popup) setCheckoutError("La commande est enregistrée, mais WhatsApp n’a pas pu s’ouvrir. Autorisez les fenêtres pop-up puis réessayez.");
      else { setCheckoutError(""); setOrderSaved(true); }
    } catch {
      setCheckoutError("La commande n’a pas pu être enregistrée. Vérifiez votre connexion puis réessayez.");
    }
  };

  return (
    <div className="situn-shell">
      <div className="topline"><span>LA SÉLECTION INDÉPENDANTE</span><span>LIVRAISON À LA LIVRAISON · FRANCE</span><span>VOTRE PLACE DANS L'HISTOIRE</span></div>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="SITUN accueil"><span className="brand-mark">✦</span><span>SITUN</span></a>
        <nav className="main-nav" aria-label="Navigation principale"><a href="#catalogue">Catalogue</a><a href="#maison">La maison</a><a href="#vendeurs">Vendeurs</a></nav>
        <button className="cart-trigger" onClick={() => setCartOpen(true)} aria-label="Ouvrir le panier"><ShoppingBag size={20} /><span>Panier</span>{totalItems > 0 && <b>{totalItems}</b>}</button>
      </header>

      <main id="top">
        <section className="hero-section">
          <div className="hero-copy">
            <p className="eyebrow"><Sparkles size={14} /> L'ART DE CHOISIR AUTREMENT</p>
            <h1>Des pièces<br /><em>avec présence.</em></h1>
            <p className="hero-intro">SITUN réunit des créateurs singuliers et des objets qui donnent du caractère au quotidien. Une marketplace curatée, sans bruit, sans détour.</p>
            <a className="gold-button" href="#catalogue">Découvrir la sélection <ArrowRight size={17} /></a>
          </div>
          <div className="hero-visual"><div className="hero-arch"><div className="hero-image" /><div className="hero-stamp">S<br />I<br />T<br />U<br />N</div></div><div className="hero-caption">01 / 04 &nbsp; — &nbsp; OBJETS CHOISIS AVEC INTENTION</div></div>
        </section>

        <section className="manifesto" id="maison"><span className="ornament">◆</span><p>Nous croyons que le beau n'a pas besoin de permission.<br /><strong>SITUN, la nouvelle adresse des esprits libres.</strong></p><span className="ornament">◆</span></section>

        <section className="catalogue-section" id="catalogue">
          <div className="section-heading"><div><p className="eyebrow">LA COLLECTION / 01</p><h2>Le choix <em>curaté</em></h2></div><p className="section-note">Des trouvailles pour celles et ceux qui préfèrent l'exception à l'évidence.</p></div>
          <div className="catalogue-tools"><div className="category-tabs">{categories.map((category) => <button className={activeCategory === category ? "active" : ""} key={category} onClick={() => setActiveCategory(category)}>{category}</button>)}</div><label className="search-box"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher une pièce..." aria-label="Rechercher une pièce" /></label></div>
          <div className="product-grid">{filteredProducts.map((product, index) => <article className="product-card" key={product.id}><div className={`product-image ${product.accent}`}><img src={product.image} alt={product.name} /><span className="product-index">0{index + 1}</span><button className="quick-add" onClick={() => addToCart(product)} aria-label={`Ajouter ${product.name} au panier`}><Plus size={18} /></button></div><div className="product-meta"><div><p className="product-category">{product.category} · {product.seller}</p><h3>{product.name}</h3></div><strong>{money(product.price)}</strong></div></article>)}</div>
          {filteredProducts.length === 0 && <div className="empty-state">Aucune pièce ne correspond à votre recherche.</div>}
        </section>

        <section className="seller-section" id="vendeurs"><div><p className="eyebrow">POUR LES CRÉATEURS</p><h2>Votre signature.<br /><em>Notre vitrine.</em></h2></div><div className="seller-copy"><p>Vous créez des objets qui méritent une place ? SITUN accompagne les maisons indépendantes et les talents émergents avec une mise en avant soignée.</p><div className="seller-calculator"><p className="calculator-label">SIMULATEUR DE COMMISSION</p><div className="calculator-fields"><label>Prix de vente<input type="number" min="0" value={sellerPrice} onChange={(event) => setSellerPrice(event.target.value)} /></label><label>Commission %<input type="number" min="0" max="100" value={sellerRate} onChange={(event) => setSellerRate(event.target.value)} /></label></div><div className="calculator-result"><span>Commission SITUN <strong>{money(calculateCommission(Number(sellerPrice) || 0, (Number(sellerRate) || 0) / 100))}</strong></span><span>Votre net estimé <strong>{money(calculateSellerNet(Number(sellerPrice) || 0, (Number(sellerRate) || 0) / 100))}</strong></span></div></div><button className="outline-button" onClick={() => window.open(`https://wa.me/${WHATSAPP}?text=Bonjour SITUN, je souhaite proposer mes produits sur votre marketplace.`, "_blank", "noopener,noreferrer")}>Devenir vendeur <ArrowRight size={16} /></button><small>La commission est réglée manuellement avec le vendeur après confirmation de la livraison. Aucun paiement en ligne n’est utilisé.</small></div></section>
      </main>

      <footer className="site-footer"><div className="footer-brand"><span className="brand-mark">✦</span><strong>SITUN</strong><p>La beauté de l'inattendu.</p></div><div><p className="footer-label">SERVICE</p><a href="#catalogue">Catalogue</a><a href="#vendeurs">Vendre avec SITUN</a></div><div><p className="footer-label">COMMANDE</p><p>Paiement à la livraison</p><p>Confirmation par WhatsApp</p></div><div className="footer-seal">SITUN<br /><span>EST. 2026</span></div></footer>

      {cartOpen && <div className="overlay" onClick={() => setCartOpen(false)}><aside className="cart-drawer" onClick={(event) => event.stopPropagation()}><div className="drawer-header"><div><p className="eyebrow">VOTRE SÉLECTION</p><h2>Le panier <em>({totalItems})</em></h2></div><button className="icon-button" onClick={() => setCartOpen(false)} aria-label="Fermer"><X /></button></div>{cart.length === 0 ? <div className="cart-empty"><ShoppingBag size={32} /><p>Votre sélection vous attend.</p><button className="outline-button" onClick={() => setCartOpen(false)}>Voir le catalogue</button></div> : <><div className="cart-items">{cart.map((item) => <div className="cart-item" key={item.id}><img src={item.image} alt="" /><div className="cart-item-info"><h3>{item.name}</h3><p>{money(item.price)}</p><div className="quantity"><button onClick={() => changeQuantity(item.id, -1)}><Minus size={13} /></button><span>{item.quantity}</span><button onClick={() => changeQuantity(item.id, 1)}><Plus size={13} /></button></div></div><button className="remove-item" onClick={() => setCart((current) => current.filter((entry) => entry.id !== item.id))} aria-label={`Supprimer ${item.name}`}><Trash2 size={16} /></button></div>)}</div><div className="cart-summary"><div><span>Sous-total</span><strong>{money(subtotal)}</strong></div><small>Paiement à la livraison · frais de livraison confirmés par WhatsApp</small><button className="gold-button full" onClick={() => { setCartOpen(false); setCheckoutOpen(true); }}>Valider la commande <ArrowRight size={17} /></button></div></>}</aside></div>}

      {checkoutOpen && <div className="overlay" onClick={() => setCheckoutOpen(false)}><div className="checkout-modal" onClick={(event) => event.stopPropagation()}><div className="drawer-header"><div><p className="eyebrow">DERNIÈRE ÉTAPE</p><h2>Confirmer <em>la commande</em></h2></div><button className="icon-button" onClick={() => setCheckoutOpen(false)} aria-label="Fermer"><X /></button></div><p className="checkout-lead">Remplissez vos coordonnées. Un récapitulatif sera préparé dans WhatsApp pour confirmer votre livraison et le paiement à la réception.</p><div className="checkout-form"><label>Nom complet<input value={customer.name} onChange={(event) => setCustomer({ ...customer, name: event.target.value })} placeholder="Votre nom" /></label><label>Téléphone<input value={customer.phone} onChange={(event) => setCustomer({ ...customer, phone: event.target.value })} placeholder="06 00 00 00 00" /></label><label>Ville et adresse de livraison<textarea value={customer.city} onChange={(event) => setCustomer({ ...customer, city: event.target.value })} placeholder="Votre adresse" rows={2} /></label><label>Note pour le vendeur <span>(facultatif)</span><textarea value={customer.note} onChange={(event) => setCustomer({ ...customer, note: event.target.value })} placeholder="Une précision ?" rows={2} /></label></div>{checkoutError && <p className="checkout-error" role="alert">{checkoutError}</p>}<div className="checkout-total"><span>Total estimé</span><strong>{money(subtotal)}</strong></div><button className="gold-button full" disabled={createOrderMutation.isPending || orderSaved} onClick={createWhatsAppOrder}>{createOrderMutation.isPending ? "Enregistrement..." : orderSaved ? "Commande enregistrée" : "Envoyer sur WhatsApp"} {!createOrderMutation.isPending && !orderSaved && <ArrowRight size={17} />}</button><p className="form-note">Aucun paiement en ligne. Vous paierez à la livraison.</p></div></div>}
    </div>
  );
}
