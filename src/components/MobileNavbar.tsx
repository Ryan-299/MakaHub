import React from 'react';
import { Home, Search, Map, Heart, User, LayoutDashboard, Building2, PlusCircle, MessageSquare } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const MobileNavbar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    setSelectedPropertyId,
    setTargetEnquiryId,
    currentUser,
    savedProperties = [],
    seekerEnquiries = [],
    listerEnquiries = [],
    isListerMode
  } = useApp();

  if (currentView === 'welcome' || currentView === 'login' || currentView === 'signup' || currentView === 'role-selection' || currentView === 'lister-subtype') {
    return null;
  }

  return (
    <nav id="makaohub-mobile-bottom-nav" className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-neutral-200 z-40 px-2 py-1.5 shadow-lg">
      <div className="flex items-center justify-around">
        {/* Seeker / Visitor Bottom Nav */}
        {!isListerMode ? (
          <>
            <button
              type="button"
              onClick={() => setCurrentView('tenant-home')}
              className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs font-semibold cursor-pointer ${
                currentView === 'tenant-home' ? 'text-black font-bold' : 'text-neutral-500 hover:text-black'
              }`}
            >
              <Home className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">Home</span>
            </button>

            <button
              type="button"
              id="mobile-nav-map-btn"
              onClick={() => {
                setSelectedPropertyId(null);
                setCurrentView('map-explore');
              }}
              className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs font-semibold cursor-pointer ${
                currentView === 'map-explore' ? 'text-black font-bold' : 'text-neutral-500 hover:text-black'
              }`}
            >
              <Map className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">Map</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentView('saved')}
              className={`relative flex flex-col items-center justify-center p-2 rounded-xl text-xs font-semibold cursor-pointer ${
                currentView === 'saved' ? 'text-black font-bold' : 'text-neutral-500 hover:text-black'
              }`}
            >
              <Heart className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">Saved</span>
              {savedProperties.length > 0 && (
                <span className="absolute top-1 right-2 w-3.5 h-3.5 bg-black text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {savedProperties.length}
                </span>
              )}
            </button>

            {currentUser && (
              <button
                type="button"
                id="mobile-nav-seeker-enquiries-btn"
                onClick={() => {
                  setTargetEnquiryId(null);
                  setCurrentView('seeker-enquiries');
                }}
                className={`relative flex flex-col items-center justify-center p-2 rounded-xl text-xs font-semibold cursor-pointer ${
                  currentView === 'seeker-enquiries' ? 'text-black font-bold' : 'text-neutral-500 hover:text-black'
                }`}
              >
                <MessageSquare className="w-5 h-5 mb-0.5" />
                <span className="text-[10px]">Enquiries</span>
                {seekerEnquiries.length > 0 && (
                  <span className="absolute top-1 right-2 w-3.5 h-3.5 bg-black text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {seekerEnquiries.length}
                  </span>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => setCurrentView(currentUser ? 'profile' : 'login')}
              className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs font-semibold cursor-pointer ${
                currentView === 'profile' ? 'text-black font-bold' : 'text-neutral-500 hover:text-black'
              }`}
            >
              <User className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">Account</span>
            </button>
          </>
        ) : (
          /* Lister Bottom Nav (Section 46: Dashboard, Listings, Add, Enquiries, Account) */
          <>
            <button
              type="button"
              onClick={() => setCurrentView('lister-dashboard')}
              className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs font-semibold cursor-pointer ${
                currentView === 'lister-dashboard' ? 'text-black font-bold' : 'text-neutral-500 hover:text-black'
              }`}
            >
              <LayoutDashboard className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">Dashboard</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentView('my-listings')}
              className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs font-semibold cursor-pointer ${
                currentView === 'my-listings' ? 'text-black font-bold' : 'text-neutral-500 hover:text-black'
              }`}
            >
              <Building2 className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">Listings</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentView('add-property')}
              className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs font-semibold cursor-pointer ${
                currentView === 'add-property' ? 'text-black font-bold' : 'text-neutral-500 hover:text-black'
              }`}
            >
              <PlusCircle className="w-5 h-5 mb-0.5 text-black" />
              <span className="text-[10px]">Add</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentView('lister-enquiries')}
              className={`relative flex flex-col items-center justify-center p-2 rounded-xl text-xs font-semibold cursor-pointer ${
                currentView === 'lister-enquiries' ? 'text-black font-bold' : 'text-neutral-500 hover:text-black'
              }`}
            >
              <MessageSquare className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">Enquiries</span>
              {listerEnquiries.length > 0 && (
                <span className="absolute top-1 right-2 w-3.5 h-3.5 bg-black text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {listerEnquiries.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setCurrentView('profile')}
              className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs font-semibold cursor-pointer ${
                currentView === 'profile' ? 'text-black font-bold' : 'text-neutral-500 hover:text-black'
              }`}
            >
              <User className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">Account</span>
            </button>
          </>
        )}
      </div>
    </nav>
  );
};
