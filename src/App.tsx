import { Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { LandingPage } from '@/pages/LandingPage'
import { AppPage } from '@/pages/AppPage'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<AppPage />} />
      </Routes>
      <Toaster />
    </>
  )
}

export default App
