
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AppProvider } from './context/AppContext.tsx';
import { ConvexProviderWrapper } from './components/ConvexProviderWrapper.tsx';
import TermsOfServiceView from './views/TermsOfServiceView.tsx';
import PrivacyPolicyView from './views/PrivacyPolicyView.tsx';
import { isConvexConfigured } from './lib/convex';
import { PushSubscriptionSync } from './components/PushSubscriptionSync';
import './index.css';

const path = window.location.pathname;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {path === '/terms' ? (
      <TermsOfServiceView />
    ) : path === '/privacy' ? (
      <PrivacyPolicyView />
    ) : (
      <ConvexProviderWrapper>
        <AppProvider>
          {isConvexConfigured && <PushSubscriptionSync />}
          <App />
        </AppProvider>
      </ConvexProviderWrapper>
    )}
  </StrictMode>,
);
