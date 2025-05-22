export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-col h-screen w-screen">
      <div className="flex-1 relative">
        {children}
      </div>
    </main>
  )
}