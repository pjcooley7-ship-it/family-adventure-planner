import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import './index.css'
import App from './App'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#0d1830',
              color: '#f2eadb',
              border: '1px solid rgba(201, 149, 42, 0.35)',
              fontFamily: "'Jost', sans-serif",
            },
          }}
        />
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
)
