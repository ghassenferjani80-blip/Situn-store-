import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";

const euro = (cents: number) => `${(cents / 100).toFixed(2).replace(".", ",")} €`;

export default function Admin() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const isAdmin = user?.role === "admin";
  const orders = trpc.marketplace.adminOrders.useQuery(undefined, { enabled: isAdmin });
  const products = trpc.marketplace.adminProducts.useQuery(undefined, { enabled: isAdmin });
  const updateStatus = trpc.marketplace.updateCommissionStatus.useMutation({
    onSuccess: () => orders.refetch(),
  });

  if (loading) return <main className="admin-page"><p>Chargement…</p></main>;
  if (!isAuthenticated) return <main className="admin-page"><div className="admin-card"><p className="eyebrow">SITUN / OWNER ACCESS</p><h1>Connexion propriétaire.</h1><p>Connectez-vous avec le compte Manus qui a créé le projet SITUN pour gérer les annonces, les commandes et les commissions manuelles.</p><Button onClick={() => startLogin()}>Se connecter comme propriétaire</Button></div></main>;
  if (!isAdmin) return <main className="admin-page"><div className="admin-card"><p className="eyebrow">SITUN / OWNER ACCESS</p><h1>Accès réservé au propriétaire.</h1><p>Ce compte est connecté, mais il n’a pas les droits admin de SITUN. Déconnectez-vous et utilisez le compte qui a créé le projet.</p><div className="admin-actions"><Button onClick={() => logout()}>Changer de compte</Button><Link href="/"><Button variant="outline">Retourner à SITUN</Button></Link></div></div></main>;

  return <main className="admin-page"><header className="admin-header"><div><p className="eyebrow">SITUN / OWNER CONTROL</p><h1>Suivi des commissions</h1><p>Gérez manuellement le statut des commissions après chaque mise en relation.</p></div><div className="admin-actions"><Link href="/"><Button variant="outline">Voir le site</Button></Link><Button variant="ghost" onClick={() => logout()}>Déconnexion</Button></div></header><section className="admin-card"><div className="admin-summary"><span>Commandes reçues</span><strong>{orders.data?.length ?? 0}</strong></div>{orders.isLoading ? <p>Chargement des commandes…</p> : orders.data?.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Commande</th><th>Client</th><th>Total</th><th>Revenu SITUN</th><th>Statut</th><th>Action</th></tr></thead><tbody>{orders.data.map((order) => <tr key={order.id}><td>#{order.id}</td><td>{order.customerName}<br /><small>{order.customerPhone}</small></td><td>{euro(order.subtotalCents + order.buyerFeeCents)}</td><td>{euro(order.commissionCents + order.buyerFeeCents)}</td><td><span className={`status-pill ${order.commissionCollectionStatus}`}>{order.commissionCollectionStatus}</span></td><td><select value={order.commissionCollectionStatus} onChange={(event) => updateStatus.mutate({ orderId: order.id, status: event.target.value as "pending" | "collected" | "waived" })} disabled={updateStatus.isPending}><option value="pending">pending</option><option value="collected">collected</option><option value="waived">waived</option></select></td></tr>)}</tbody></table></div> : <p className="admin-empty">لا توجد طلبات محفوظة حتى الآن.</p>}</section><section className="admin-card"><div className="admin-summary"><span>Annonces à contrôler</span><strong>{products.data?.length ?? 0}</strong></div>{products.isLoading ? <p>Chargement des annonces…</p> : products.data?.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Annonce</th><th>Catégorie</th><th>Prix</th><th>Statut</th><th>Créée le</th></tr></thead><tbody>{products.data.map((product) => <tr key={product.id}><td>{product.name}</td><td>{product.category}</td><td>{euro(product.priceCents)}</td><td><span className={`status-pill ${product.status}`}>{product.status}</span></td><td>{new Date(product.createdAt).toLocaleDateString()}</td></tr>)}</tbody></table></div> : <p className="admin-empty">لا توجد إعلانات محفوظة حتى الآن.</p>}</section></main>;
}
