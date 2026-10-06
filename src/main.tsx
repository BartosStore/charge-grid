import '@fontsource-variable/inter';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { initI18n } from './i18n';
import { startMockBackend } from './mocks/browser';
import { store } from './store/store';

async function bootstrap() {
  // There is no real backend – MSW answers REST calls and the WebSocket stream in the browser.
  await startMockBackend();
  await initI18n(store.getState().ui.language);

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

void bootstrap();
