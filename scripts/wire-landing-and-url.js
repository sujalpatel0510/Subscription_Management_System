const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, '..', 'src', 'app', 'page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// 1. Add LandingPage import
if (!content.includes("import LandingPage from '@/components/LandingPage';")) {
  content = content.replace(
    "import WelcomeCard from '@/components/WelcomeCard';",
    "import WelcomeCard from '@/components/WelcomeCard';\nimport LandingPage from '@/components/LandingPage';"
  );
}

// 2. Add currentView state and URL synchronization
const stateMarker = "const [activeTab, setActiveTab] = useState<TabId>('dashboard');";
const urlSyncLogic = `const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [currentView, setCurrentView] = useState<'app' | 'landing'>('app');

  // Synchronize state with URL parameters on mount and browser navigation (Back / Forward)
  useEffect(() => {
    const syncFromUrl = () => {
      if (typeof window === 'undefined') return;
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get('view');
      const tabParam = params.get('tab') as TabId | null;

      if (viewParam === 'landing') {
        setCurrentView('landing');
      } else if (tabParam) {
        setActiveTab(tabParam);
        setCurrentView('app');
      }
    };

    syncFromUrl();
    window.addEventListener('popstate', syncFromUrl);
    return () => window.removeEventListener('popstate', syncFromUrl);
  }, []);

  // Change tab and synchronize browser URL without full-page reload
  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId);
    setCurrentView('app');
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tabId);
      url.searchParams.delete('view');
      window.history.pushState({ tab: tabId, view: 'app' }, '', url.toString());
    }
  };

  // Switch to public landing page and update URL
  const handleShowLanding = () => {
    setCurrentView('landing');
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('view', 'landing');
      url.searchParams.delete('tab');
      window.history.pushState({ view: 'landing' }, '', url.toString());
    }
  };

  // Launch application console from landing page
  const handleEnterApp = (targetTab: TabId = 'dashboard') => {
    setCurrentView('app');
    handleTabChange(targetTab);
  };`;

if (!content.includes("const [currentView, setCurrentView]")) {
  content = content.replace(stateMarker, urlSyncLogic);
}

// 3. Connect handleTabChange and onShowLanding to Sidebar and Header
content = content.replace(
  `      {/* 1. Sleek Modern Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}`,
  `      {/* 1. Sleek Modern Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onShowLanding={handleShowLanding}`
);

content = content.replace(
  `        {/* Top Navigation Header */}
        <Header
          activeTab={activeTab}`,
  `        {/* Top Navigation Header */}
        <Header
          activeTab={activeTab}
          onShowLanding={handleShowLanding}`
);

// 4. Wrap the return statement with conditional LandingPage rendering
const oldReturnStart = `  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground antialiased selection:bg-primary selection:text-primary-foreground">`;

const newReturnStart = `  if (currentView === 'landing') {
    return <LandingPage onEnterApp={handleEnterApp} plans={plans} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground antialiased selection:bg-primary selection:text-primary-foreground">`;

if (!content.includes("if (currentView === 'landing')")) {
  content = content.replace(oldReturnStart, newReturnStart);
}

fs.writeFileSync(pagePath, content, 'utf8');
console.log('Successfully wired Landing Page and URL synchronization in page.tsx');
