import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
// Pages
import Feed from './pages/Feed';
import Communities from './pages/Communities';
import CommunityDetail from './pages/CommunityDetail';
import CreateCommunity from './pages/CreateCommunity';
import Repository from './pages/Repository';
import Videos from './pages/Videos';
import Lives from './pages/Lives';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Disc from './pages/Disc';
import DiscTest from './pages/DiscTest';
import DiscResult from './pages/DiscResult';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
// Layout
import Layout from './components/Layout';
import ApprovalGate from './components/ApprovalGate';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin, isAuthenticated } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground font-medium">Carregando Universo Gold...</p>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  // Se não está autenticado e não está nas rotas públicas, redireciona para login
  const publicPaths = ['/login', '/forgot-password', '/reset-password'];
  const isPublicPath = publicPaths.some(p => window.location.pathname.startsWith(p));
  if (!isAuthenticated && !isPublicPath) {
    navigateToLogin();
    return null;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<ApprovalGate><Layout /></ApprovalGate>}>
        <Route path="/" element={<Feed />} />
        <Route path="/communities" element={<Communities />} />
        <Route path="/communities/create" element={<CreateCommunity />} />
        <Route path="/communities/:id" element={<CommunityDetail />} />
        <Route path="/repository" element={<Repository />} />
        <Route path="/videos" element={<Videos />} />
        <Route path="/lives" element={<Lives />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/disc" element={<Disc />} />
        <Route path="/disc/teste/:id" element={<DiscTest />} />
        <Route path="/disc/resultado/:id" element={<DiscResult />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;