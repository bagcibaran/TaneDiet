import type { ReactNode } from 'react'

type AppLayoutProps = {
    children: ReactNode
}

function AppLayout({ children }: AppLayoutProps) {
    return <div className="min-h-screen bg-cream">{children}</div>
}

export default AppLayout
