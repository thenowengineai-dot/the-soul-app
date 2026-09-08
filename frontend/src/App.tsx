import { useState } from 'react'
import { Sidebar, AuthModal, ProfileSettingsModal } from './features/navigation'
import { HomeView, HomeTopBar } from './features/home'
import { ProfileView } from './features/profile'
import {
  ChatView,
  type ChatConversation,
  getCurrentUser,
  loginWithGoogle,
  signOutUser,
  saveUserIdentity,
  type UserIdentity
} from './features/chat'
import type { Character } from './features/characters'

function App() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState<boolean>(false);
  const [selectedMenu, setSelectedMenu] = useState<string>('home');
  const [currentView, setCurrentView] = useState<'home' | 'chat' | 'profile'>('home');
  const [activeChatCharacter, setActiveChatCharacter] = useState<ChatConversation | null>(null);

  // 1. Identity & Auth State
  const [currentUser, setCurrentUser] = useState<UserIdentity>(() => getCurrentUser());
  const isLoggedIn = !currentUser.is_guest;

  const [userName, setUserName] = useState<string>(() => {
    return currentUser.name && !currentUser.is_guest ? currentUser.name : 'นักเดินทาง';
  });
  const [userInitial, setUserInitial] = useState<string>(() => {
    return currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'N';
  });
  const [userEmail, setUserEmail] = useState<string>(() => currentUser.email || '');
  const [userProfile, setUserProfile] = useState({
    pronouns: currentUser.pronouns || 'คุณ',
    aboutMe: currentUser.about_me || 'ชอบบทสนทนาที่เป็นกันเอง อบอุ่น และหยอกล้อเบาๆ',
    username: currentUser.username || `@${(currentUser.name || 'user').toLowerCase().replace(/\s+/g, '_')}`,
  });

  // 2. Modals & Dropdowns State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  // 3. Economy & Notification State
  const [coinBalance, setCoinBalance] = useState<number>(() => {
    const saved = localStorage.getItem('the_soul_coin_balance');
    return saved ? parseInt(saved, 10) : 1250;
  });
  const [notificationCount] = useState<number>(3);

  const handleMenuClick = (id: string) => {
    setSelectedMenu(id);
    if (id === 'home') {
      setCurrentView('home');
    } else if (id === 'profile' || id === 'settings') {
      setCurrentView('profile');
      setIsSidebarExpanded(false);
    } else {
      setCurrentView('chat');
      setIsSidebarExpanded(false);
    }
  };

  const handleNavigateToChat = (char?: Character, options?: { forceNewSession?: boolean }) => {
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
        forceNewSession: options?.forceNewSession,
        sessionTriggerKey: options?.forceNewSession ? Date.now() : undefined,
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
    setCoinBalance(prev => {
      const next = prev + 50;
      localStorage.setItem('the_soul_coin_balance', next.toString());
      return next;
    });
  };

  const handleNotificationClick = () => {
    // Notification center
  };

  const handleProfileClick = () => {
    setIsProfileDropdownOpen(prev => !prev);
  };

  const handleLoginClick = () => {
    setAuthModalMode('login');
    setIsAuthModalOpen(true);
  };

  const handleSignupClick = () => {
    setAuthModalMode('signup');
    setIsAuthModalOpen(true);
  };

  // Google Login Callback
  const handleGoogleSuccess = async (credential: string) => {
    try {
      if (credential && credential !== 'demo_google_credential_token') {
        const user = await loginWithGoogle(credential);
        setCurrentUser(user);
        setUserName(user.name);
        setUserInitial(user.name.charAt(0).toUpperCase());
        setUserEmail(user.email || '');
      } else {
        // Instant Google One-Click Experience
        const demoUser: UserIdentity = {
          user_id: `usr_google_${Date.now()}`,
          name: 'Google Traveler',
          email: 'traveler@gmail.com',
          username: '@google_traveler',
          is_guest: false,
          pronouns: 'คุณ',
          about_me: 'ผู้ใช้ผ่าน Google Account พร้อมท่องโลก Maomoi AI',
          migrated_sessions: 1,
        };
        saveUserIdentity(demoUser);
        setCurrentUser(demoUser);
        setUserName(demoUser.name);
        setUserInitial(demoUser.name.charAt(0).toUpperCase());
        setUserEmail(demoUser.email || '');
        setUserProfile({
          pronouns: demoUser.pronouns || 'คุณ',
          aboutMe: demoUser.about_me || '',
          username: demoUser.username || '@google_traveler',
        });
      }
      setIsAuthModalOpen(false);
    } catch (err) {
      console.warn('Google login failed, using client session:', err);
      const demoUser: UserIdentity = {
        user_id: `usr_google_${Date.now()}`,
        name: 'Google Traveler',
        email: 'traveler@gmail.com',
        username: '@google_traveler',
        is_guest: false,
      };
      saveUserIdentity(demoUser);
      setCurrentUser(demoUser);
      setUserName(demoUser.name);
      setUserInitial(demoUser.name.charAt(0).toUpperCase());
      setUserEmail(demoUser.email || '');
      setIsAuthModalOpen(false);
    }
  };

  // Email Submit Callback
  const handleEmailSubmit = (email: string, mode: 'login' | 'signup') => {
    const rawName = email.split('@')[0] || (mode === 'login' ? 'ผู้ใช้งาน' : 'สมาชิกใหม่');
    const formattedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
    const newUser: UserIdentity = {
      user_id: `usr_${Date.now()}`,
      name: formattedName,
      email: email,
      username: `@${rawName.toLowerCase().replace(/[^a-z0-9_]/g, '')}`,
      is_guest: false,
      pronouns: 'คุณ',
      about_me: 'ชอบบทสนทนาที่เป็นกันเอง อบอุ่น และหยอกล้อเบาๆ',
    };
    saveUserIdentity(newUser);
    setCurrentUser(newUser);
    setUserName(newUser.name);
    setUserInitial(newUser.name.charAt(0).toUpperCase());
    setUserEmail(newUser.email || '');
    setUserProfile({
      pronouns: newUser.pronouns || 'คุณ',
      aboutMe: newUser.about_me || '',
      username: newUser.username || `@${rawName.toLowerCase()}`,
    });
    setIsAuthModalOpen(false);
  };

  // Sign Out Handler
  const handleSignOut = () => {
    const guest = signOutUser();
    setCurrentUser(guest);
    setUserName('นักเดินทาง');
    setUserInitial('N');
    setUserEmail('');
    setIsProfileDropdownOpen(false);
    setIsProfileModalOpen(false);
  };

  // Profile Save Handler
  const handleSaveProfile = (updatedData: {
    name: string;
    username: string;
    pronouns: string;
    aboutMe: string;
    avatarUrl?: string;
  }) => {
    const updatedUser: UserIdentity = {
      ...currentUser,
      name: updatedData.name,
      username: updatedData.username,
      pronouns: updatedData.pronouns,
      about_me: updatedData.aboutMe,
      avatar_url: updatedData.avatarUrl || currentUser.avatar_url,
    };
    saveUserIdentity(updatedUser);
    setCurrentUser(updatedUser);
    setUserName(updatedData.name);
    setUserInitial(updatedData.name.charAt(0).toUpperCase());
    setUserProfile({
      pronouns: updatedData.pronouns,
      aboutMe: updatedData.aboutMe,
      username: updatedData.username,
    });
  };

  // Coupon Redeem Handler
  const handleRedeemCoupon = (rawCode: string) => {
    const code = rawCode.trim().toUpperCase();
    const redeemedKey = 'the_soul_redeemed_coupons';
    let redeemedList: string[] = [];
    try {
      const raw = localStorage.getItem(redeemedKey);
      if (raw) redeemedList = JSON.parse(raw);
    } catch {
      redeemedList = [];
    }

    if (redeemedList.includes(code)) {
      return { success: false, message: 'คุณเคยแลกรับโค้ดคูปองนี้ไปแล้ว' };
    }

    const couponValues: Record<string, number> = {
      MAOMOI2026: 500,
      MAOMOI: 300,
      MAOMOIFREE: 200,
      MAOMOI100: 100,
      WELCOME100: 100,
      ALICE: 150,
      VIP2026: 1000,
    };

    if (couponValues[code]) {
      const added = couponValues[code];
      const newBalance = coinBalance + added;
      setCoinBalance(newBalance);
      localStorage.setItem('the_soul_coin_balance', newBalance.toString());
      redeemedList.push(code);
      localStorage.setItem(redeemedKey, JSON.stringify(redeemedList));
      return {
        success: true,
        message: `แลกรับสำเร็จ! ได้รับ +${added.toLocaleString()} เหรียญ 🪙`,
        coinsAdded: added,
      };
    }

    return {
      success: false,
      message: 'รหัสคูปองไม่ถูกต้อง หรือหมดอายุการใช้งานแล้ว',
    };
  };

  return (
    <div className="h-screen w-full bg-app-bg text-app-primary font-sans flex flex-col relative overflow-hidden">
      {/* 1. Main View Rendering */}
      {currentView === 'profile' ? (
        <>
          {/* Full-Width Top Bar */}
          <HomeTopBar 
            onLogoClick={handleBackToHome}
            coinBalance={coinBalance}
            notificationCount={notificationCount}
            onCoinClick={handleCoinClick}
            onNotificationClick={handleNotificationClick}
            onProfileClick={handleProfileClick}
            userInitial={userInitial}
            userName={userName}
            userEmail={userEmail}
            isLoggedIn={isLoggedIn}
            onLoginClick={handleLoginClick}
            onSignupClick={handleSignupClick}
            isProfileDropdownOpen={isProfileDropdownOpen}
            onCloseProfileDropdown={() => setIsProfileDropdownOpen(false)}
            onEditProfileClick={() => {
              setIsProfileDropdownOpen(false);
              handleMenuClick('profile');
            }}
            onSignOut={handleSignOut}
          />

          {/* Lower Area: Sidebar + ProfileView */}
          <div className="flex-1 flex relative overflow-hidden overscroll-none touch-pan-y">
            <Sidebar 
              isSidebarExpanded={isSidebarExpanded}
              setIsSidebarExpanded={setIsSidebarExpanded}
              selectedMenu={selectedMenu}
              handleMenuClick={handleMenuClick}
              onLogoClick={handleBackToHome}
              onComposeClick={() => handleNavigateToChat()}
              isHomeMode={true}
              userName={userName}
              userInitial={userInitial}
              userHandle={userProfile.username}
              isLoggedIn={isLoggedIn}
              onLoginClick={handleLoginClick}
            />
            <ProfileView 
              userName={userName}
              userEmail={userEmail}
              userInitial={userInitial}
              coinBalance={coinBalance}
              pronouns={userProfile.pronouns}
              aboutMe={userProfile.aboutMe}
              username={userProfile.username}
              onSaveProfile={handleSaveProfile}
              onRedeemCoupon={handleRedeemCoupon}
              onSignOut={handleSignOut}
              onBackToHome={handleBackToHome}
              onTopUpCoins={handleCoinClick}
            />
          </div>
        </>
      ) : currentView === 'home' ? (
        <>
          {/* Full-Width Top Bar */}
          <HomeTopBar 
            onLogoClick={handleBackToHome}
            coinBalance={coinBalance}
            notificationCount={notificationCount}
            onCoinClick={handleCoinClick}
            onNotificationClick={handleNotificationClick}
            onProfileClick={handleProfileClick}
            userInitial={userInitial}
            userName={userName}
            userEmail={userEmail}
            isLoggedIn={isLoggedIn}
            onLoginClick={handleLoginClick}
            onSignupClick={handleSignupClick}
            isProfileDropdownOpen={isProfileDropdownOpen}
            onCloseProfileDropdown={() => setIsProfileDropdownOpen(false)}
            onEditProfileClick={() => {
              setIsProfileDropdownOpen(false);
              handleMenuClick('profile');
            }}
            onSignOut={handleSignOut}
          />

          {/* Lower Area: Sidebar + HomeView */}
          <div className="flex-1 flex relative overflow-hidden overscroll-none touch-pan-y">
            <Sidebar 
              isSidebarExpanded={isSidebarExpanded}
              setIsSidebarExpanded={setIsSidebarExpanded}
              selectedMenu={selectedMenu}
              handleMenuClick={handleMenuClick}
              onLogoClick={handleBackToHome}
              onComposeClick={() => handleNavigateToChat()}
              isHomeMode={true}
              userName={userName}
              userInitial={userInitial}
              userHandle={userProfile.username}
              isLoggedIn={isLoggedIn}
              onLoginClick={handleLoginClick}
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
              isLoggedIn={isLoggedIn}
              onLoginClick={handleLoginClick}
              onSignupClick={handleSignupClick}
            />
          </div>
        </>
      ) : (
        <div className="h-screen w-full bg-app-bg text-app-primary font-sans flex relative overflow-hidden overscroll-none touch-pan-y">
          <Sidebar 
            isSidebarExpanded={isSidebarExpanded}
            setIsSidebarExpanded={setIsSidebarExpanded}
            selectedMenu={selectedMenu}
            handleMenuClick={handleMenuClick}
            onLogoClick={handleBackToHome}
            onComposeClick={() => handleNavigateToChat()}
            isHomeMode={false}
            userName={userName}
            userInitial={userInitial}
            userHandle={userProfile.username}
            isLoggedIn={isLoggedIn}
            onLoginClick={handleLoginClick}
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
            userEmail={userEmail}
            isLoggedIn={isLoggedIn}
            onLoginClick={handleLoginClick}
            onSignupClick={handleSignupClick}
            isProfileDropdownOpen={isProfileDropdownOpen}
            onCloseProfileDropdown={() => setIsProfileDropdownOpen(false)}
            onEditProfileClick={() => {
              setIsProfileDropdownOpen(false);
              handleMenuClick('profile');
            }}
            onSignOut={handleSignOut}
          />
        </div>
      )}

      {/* 2. Global Modals */}
      {/* Auth Pop-up (CrushOn AI Inspired Modal) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        onGoogleSuccess={handleGoogleSuccess}
        onEmailSubmit={handleEmailSubmit}
      />

      {/* Profile Settings & Coupon Redeem Modal (Pinterest Inspired) */}
      <ProfileSettingsModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userName={userName}
        userEmail={userEmail}
        userInitial={userInitial}
        coinBalance={coinBalance}
        pronouns={userProfile.pronouns}
        aboutMe={userProfile.aboutMe}
        onSaveProfile={handleSaveProfile}
        onRedeemCoupon={handleRedeemCoupon}
        onSignOut={handleSignOut}
      />
    </div>
  );
}

export default App;
