import '@fontsource-variable/inter';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { initI18n } from './i18n';
import { startMockBackend } from './mocks/browser';

async function bootstrap() {
  // There is no real backend – MSW answers REST calls in the browser.
  await startMockBackend();
  await initI18n('cs');

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

void bootstrap();
