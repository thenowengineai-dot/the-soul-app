import { useState, useEffect } from 'react'
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
  type UserIdentity,
  fetchWalletBalance,
  redeemCouponApi,
} from './features/chat'
import type { Character } from './features/characters'
import { WorldCreatorView } from './features/world-creator'

function App() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState<boolean>(false);
  const [selectedMenu, setSelectedMenu] = useState<string>('home');
  const [currentView, setCurrentView] = useState<'home' | 'chat' | 'profile' | 'world-creator'>('home');
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
    return saved ? parseInt(saved, 10) : 50;
  });
  const [notificationCount] = useState<number>(3);

  // 🔄 Synchronize real wallet balance from Neon PostgreSQL & Redis Hot Cache
  useEffect(() => {
    if (currentUser?.user_id) {
      fetchWalletBalance(currentUser.user_id)
        .then((res) => {
          if (typeof res.balance === 'number') {
            setCoinBalance(res.balance);
            localStorage.setItem('the_soul_coin_balance', res.balance.toString());
          }
        })
        .catch((err) => {
          console.warn('[WALLET] Could not sync balance with backend:', err);
        });
    }
  }, [currentUser?.user_id]);

  const handleMenuClick = (id: string) => {
    setSelectedMenu(id);
    if (id === 'home') {
      setCurrentView('home');
    } else if (id === 'profile' || id === 'settings') {
      setCurrentView('profile');
      setIsSidebarExpanded(false);
    } else if (id === 'world-creator' || id === 'genesis') {
      setCurrentView('world-creator');
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
    handleMenuClick('profile');
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

  // Coupon Redeem Handler with Real Backend
  const handleRedeemCoupon = async (rawCode: string) => {
    const code = rawCode.trim().toUpperCase();
    if (!code) {
      return { success: false, message: 'กรุณาระบุรหัสคูปอง' };
    }

    try {
      const res = await redeemCouponApi(currentUser.user_id, code);
      if (res.status === 'success' && typeof res.new_balance === 'number') {
        setCoinBalance(res.new_balance);
        localStorage.setItem('the_soul_coin_balance', res.new_balance.toString());
        return {
          success: true,
          message: res.message,
          coinsAdded: res.coins_added,
        };
      } else {
        return {
          success: false,
          message: res.message || 'รหัสคูปองไม่ถูกต้อง หรือหมดอายุการใช้งานแล้ว',
        };
      }
    } catch (e) {
      console.error('[COUPON] Redeem error:', e);
      return {
        success: false,
        message: 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง',
      };
    }
  };

  return (
    <div className="h-screen w-full bg-app-bg text-app-primary font-sans flex flex-col relative overflow-hidden">
      {/* 1. Main View Rendering */}
      {currentView === 'world-creator' ? (
        <WorldCreatorView
          onExit={handleBackToHome}
          onPlayCampaign={(campaign) => {
            handleNavigateToChat({
              id: campaign.id,
              name: campaign.name,
              image: campaign.avatar,
              defaultWorld: campaign.defaultWorld,
            } as Character, { forceNewSession: true });
          }}
        />
      ) : currentView === 'profile' ? (
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
            onCoinBalanceUpdate={(newBalance) => setCoinBalance(newBalance)}
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
