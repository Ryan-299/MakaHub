import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AppProvider } from './context/AppContext.tsx';
import { ConvexProviderWrapper } from './components/ConvexProviderWrapper.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConvexProviderWrapper>
      <AppProvider>
        <App />
      </AppProvider>
    </ConvexProviderWrapper>
  </StrictMode>,
);

