import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Inter Tight yazı tipi kendi sunucumuzdan gelir (Google'a istek gitmez)
import '@fontsource/inter-tight/400.css'
import '@fontsource/inter-tight/500.css'
import '@fontsource/inter-tight/600.css'
import '@fontsource/inter-tight/700.css'
import '@fontsource/inter-tight/800.css'
import './index.css'
import App from './App.tsx'
import FeedbackProvider from './components/feedback/FeedbackProvider'
import './i18n'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FeedbackProvider>
      <App />
    </FeedbackProvider>
  </StrictMode>,
)
