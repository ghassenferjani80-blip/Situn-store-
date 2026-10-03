import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import LanguageDock from "./components/LanguageDock";
import WhatsAppFloat from "./components/WhatsAppFloat";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CartProvider } from "./contexts/CartContext";
const Home = lazy(() => import("./pages/Home"));
const Admin = lazy(() => import("./pages/Admin"));
const Legal = lazy(() => import("@/pages/Legal"));
const Services = lazy(() => import("./pages/Services"));
const Profile = lazy(() => import("./pages/Profile"));
const Workspace = lazy(() => import("./pages/Workspace"));
const Marketplace = lazy(() => import("./pages/Marketplace"));
const Promotion = lazy(() => import("./pages/Promotion"));
const PostWizard = lazy(() => import("./pages/PostWizard"));
const PostDetail = lazy(() => import("./pages/PostDetail"));
const Auth = lazy(() => import("./pages/Auth"));

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Suspense fallback={<main className="section-page"><p className="section-empty">جاري تحميل SITUN...</p></main>}><Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/admin"} component={Admin} />
      <Route path={"/auth"} component={Auth} />
      {/* Backward-compatible owner links; Admin still enforces server-side access. */}
      <Route path={"/owner"} component={Admin} />
      <Route path={"/owner-dashboard"} component={Admin} />
      <Route path={"/dashboard"} component={Admin} />
      <Route path={"/informations"} component={Legal} />
      <Route path={"/services"} component={Services} />
      <Route path={"/promotion"} component={Promotion} />
      <Route path={"/marketplace"} component={Marketplace} />
      <Route path={"/profile/:id"} component={Profile} />
      <Route path={"/workspace"} component={Workspace} />
      <Route path={"/publish"} component={PostWizard} />
      <Route path={"/post/:id"} component={PostDetail} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch></Suspense>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <LanguageDock />
          <WhatsAppFloat />
          <CartProvider>
            <Router />
          </CartProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
