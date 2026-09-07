import { useState } from 'react'
import { Sidebar } from './features/navigation'
import { HomeView, HomeTopBar } from './features/home'
import { ChatView } from './features/chat'

function App() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState<boolean>(false);
  const [selectedMenu, setSelectedMenu] = useState<string>('home');
  const [currentView, setCurrentView] = useState<'home' | 'chat'>('home');

  const handleMenuClick = (id: string) => {
    setSelectedMenu(id);
    if (id === 'home') {
      setCurrentView('home');
    } else {
      setCurrentView('chat');
      setIsSidebarExpanded(false);
    }
  };

  const handleNavigateToChat = () => {
    setCurrentView('chat');
    setSelectedMenu('chats');
    setIsSidebarExpanded(false);
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setSelectedMenu('home');
  };

  const [coinBalance, setCoinBalance] = useState<number>(1250);
  const [notificationCount] = useState<number>(3);
  const [userName] = useState<string>('Alice');
  const [userInitial] = useState<string>('A');

  const handleCoinClick = () => {
    setCoinBalance(prev => prev + 50);
  };

  const handleNotificationClick = () => {
    // Open notification center
  };

  const handleProfileClick = () => {
    // Open profile menu
  };

  if (currentView === 'home') {
    return (
      <div className="h-screen w-full bg-app-bg text-app-primary font-sans flex flex-col relative overflow-hidden">
        {/* 1. Full-Width Top Bar (โลโก้เต็ม + กล่องค้นหา + ปุ่ม Action + เส้นแนวนอนยาวเต็มจอ) */}
        <HomeTopBar 
          onLogoClick={handleBackToHome}
          coinBalance={coinBalance}
          notificationCount={notificationCount}
          onCoinClick={handleCoinClick}
          onNotificationClick={handleNotificationClick}
          onProfileClick={handleProfileClick}
          userInitial={userInitial}
          userName={userName}
        />

        {/* 2. Lower Area: Sidebar (isHomeMode={true}) + HomeView */}
        <div className="flex-1 flex relative overflow-hidden">
          <Sidebar 
            isSidebarExpanded={isSidebarExpanded}
            setIsSidebarExpanded={setIsSidebarExpanded}
            selectedMenu={selectedMenu}
            handleMenuClick={handleMenuClick}
            onLogoClick={handleBackToHome}
            onComposeClick={handleNavigateToChat}
            isHomeMode={true}
          />
          <HomeView 
            onNavigateToChat={handleNavigateToChat}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-app-bg text-app-primary font-sans flex relative overflow-hidden">
      {/* ห้องแชท: คงโครงสร้างเดิม 100% ตามความต้องการ */}
      <Sidebar 
        isSidebarExpanded={isSidebarExpanded}
        setIsSidebarExpanded={setIsSidebarExpanded}
        selectedMenu={selectedMenu}
        handleMenuClick={handleMenuClick}
        onLogoClick={handleBackToHome}
        onComposeClick={handleNavigateToChat}
        isHomeMode={false}
      />
      <ChatView 
        onBackToHome={handleBackToHome}
        coinBalance={coinBalance}
        notificationCount={notificationCount}
        onCoinClick={handleCoinClick}
        onNotificationClick={handleNotificationClick}
        onProfileClick={handleProfileClick}
        userInitial={userInitial}
        userName={userName}
      />
    </div>
  );
}

export default App;
