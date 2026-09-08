import { useState } from 'react'
import { Sidebar } from './features/navigation'
import { HomeView, HomeTopBar } from './features/home'
import { ChatView, type ChatConversation, getCurrentUser } from './features/chat'
import type { Character } from './features/characters'

function App() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState<boolean>(false);
  const [selectedMenu, setSelectedMenu] = useState<string>('home');
  const [currentView, setCurrentView] = useState<'home' | 'chat'>('home');
  const [activeChatCharacter, setActiveChatCharacter] = useState<ChatConversation | null>(null);

  const [coinBalance, setCoinBalance] = useState<number>(1250);
  const [notificationCount] = useState<number>(3);
  const [userName] = useState<string>(() => {
    const user = getCurrentUser();
    return user && user.name && !user.is_guest ? user.name : 'นักเดินทาง';
  });
  const [userInitial] = useState<string>(() => {
    const user = getCurrentUser();
    return user && user.name ? user.name.charAt(0).toUpperCase() : 'N';
  });

  const handleMenuClick = (id: string) => {
    setSelectedMenu(id);
    if (id === 'home') {
      setCurrentView('home');
    } else {
      setCurrentView('chat');
      setIsSidebarExpanded(false);
    }
  };

  const handleNavigateToChat = (char?: Character) => {
    if (char) {
      setActiveChatCharacter({
        id: char.id,
        name: char.name,
        message: char.quote || 'พร้อมเริ่มต้นบทสนทนา...',
        time: 'ตอนนี้',
        unread: false,
        verified: true,
        avatar: char.image || (char.images && char.images[0]) || '',
        image: char.image || (char.images && char.images[0]) || '',
        statusMessage: char.quote,
        initialEnvironment: char.initialEnvironment,
        initialOutfit: char.initialOutfit,
        initialPose: char.initialPose,
        defaultWorld: char.defaultWorld,
      });
    }
    setCurrentView('chat');
    setSelectedMenu('chats');
    setIsSidebarExpanded(false);
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setSelectedMenu('home');
  };

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
        <div className="flex-1 flex relative overflow-hidden overscroll-none touch-pan-y">
          <Sidebar 
            isSidebarExpanded={isSidebarExpanded}
            setIsSidebarExpanded={setIsSidebarExpanded}
            selectedMenu={selectedMenu}
            handleMenuClick={handleMenuClick}
            onLogoClick={handleBackToHome}
            onComposeClick={() => handleNavigateToChat()}
            isHomeMode={true}
          />
          <HomeView 
            onNavigateToChat={handleNavigateToChat}
            coinBalance={coinBalance}
            notificationCount={notificationCount}
            onCoinClick={handleCoinClick}
            onNotificationClick={handleNotificationClick}
            onProfileClick={handleProfileClick}
            userInitial={userInitial}
            userName={userName}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-app-bg text-app-primary font-sans flex relative overflow-hidden overscroll-none touch-pan-y">
      {/* ห้องแชท: คงโครงสร้างเดิม 100% ตามความต้องการ */}
      <Sidebar 
        isSidebarExpanded={isSidebarExpanded}
        setIsSidebarExpanded={setIsSidebarExpanded}
        selectedMenu={selectedMenu}
        handleMenuClick={handleMenuClick}
        onLogoClick={handleBackToHome}
        onComposeClick={() => handleNavigateToChat()}
        isHomeMode={false}
      />
      <ChatView 
        onBackToHome={handleBackToHome}
        activeCharacter={activeChatCharacter}
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
