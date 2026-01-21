import { Toaster } from '@/components/ui/sonner'

function App() {
  return (
    <>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Matty Doo</h1>
          <p className="text-muted-foreground">A super lightweight to-dos app</p>
        </div>
      </div>
      <Toaster />
    </>
  )
}

export default App
