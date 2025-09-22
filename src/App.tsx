import { ContentProvider } from "./context/ContentContext";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Expertise from "./components/Expertise";
import Blog from "./components/Blog";
import Resources from "./components/Resources";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import { Routes, Route } from 'react-router-dom';
import LibraryPage from './pages/LibraryPage';
import BlogPage from './pages/BlogPage';
import ResourceDetailPage from './pages/ResourceDetailPage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import PharmaDemoPage from './pages/PharmaDemoPage';
import PharmaEmbedPage from './pages/PharmaEmbedPage';
import ServicesPowerBIParis from './pages/ServicesPowerBIParis';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminAgents from './pages/AdminAgents';
import AdminApprovals from './pages/AdminApprovals';
import AdminWorkflow from './pages/AdminWorkflow';
import AdminArticles from './pages/AdminArticles';
import AdminResources from './pages/AdminResources';
import AdminSettings from './pages/AdminSettings';
import LinkedInAgentPage from './pages/LinkedInAgentPage';
import GEOAgentPage from './pages/GEOAgentPage';
import { AdminDataProvider } from './context/AdminDataContext';
import { useLocation } from 'react-router-dom';

function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  return (
    <ContentProvider>
      {!isAdmin && <Header />}
      <Routes>
        <Route path="/" element={<>
          <Hero />
          <Expertise />
          <Blog />
          <Resources />
          <Contact />
        </>} />
        <Route path="/bibliotheque" element={<LibraryPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/resource/templates-dashboard-phrama" element={<PharmaEmbedPage />} />
        <Route path="/resource/:slug" element={<ResourceDetailPage />} />
        <Route path="/services/power-bi-paris" element={<ServicesPowerBIParis />} />
        <Route path="/blog/:slug" element={<ArticleDetailPage />} />
        <Route path="/pharma" element={<PharmaDemoPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminDataProvider><AdminLayout /></AdminDataProvider>} >
          <Route index element={<AdminDashboard />} />
          <Route path="workflow" element={<AdminWorkflow />} />
          <Route path="articles" element={<AdminArticles />} />
          <Route path="resources" element={<AdminResources />} />
          <Route path="agents" element={<AdminAgents />} />
          <Route path="linkedin-agent" element={<LinkedInAgentPage />} />
          <Route path="geo-agent" element={<GEOAgentPage />} />
          <Route path="approvals" element={<AdminApprovals />} />
          <Route path="seo" element={<AdminDashboard />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="settings" element={<AdminSettings />} />
          {/* Backward compatibility */}
          <Route path="content" element={<AdminPage />} />
        </Route>
      </Routes>
      {!isAdmin && <Footer />}
    </ContentProvider>
  );
}

export default App;