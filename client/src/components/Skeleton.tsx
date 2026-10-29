type SkeletonCardProps = {
    // Kartın içinde kaç satır gri çizgi olsun
    lines?: number
    // true: başka bir kartın içinde (kendi gölgeli kutusu olmadan)
    bare?: boolean
    // Ekran okuyucular için görünmez "yükleniyor" yazısı
    label?: string
}

// İçerik yüklenirken gösterilen gri taslak: sayfanın şekli hemen belli olur, "Yükleniyor..." yazısı yerine
export function SkeletonCard({ lines = 3, bare = false, label }: SkeletonCardProps) {
    return (
        <div
            role={label ? 'status' : undefined}
            className={`animate-pulse space-y-3 ${bare ? 'mt-4' : 'rounded-3xl bg-card p-5 shadow-soft'}`}
        >
            {label && <span className="sr-only">{label}</span>}
            <div aria-hidden="true" className="h-5 w-2/5 rounded-full bg-line" />
            {Array.from({ length: lines }, (_, index) => (
                <div
                    key={index}
                    aria-hidden="true"
                    className={`h-3.5 rounded-full bg-line/70 ${index === lines - 1 ? 'w-3/5' : 'w-full'}`}
                />
            ))}
        </div>
    )
}

// Sayfa yüklenirken birkaç gri kart alt alta
export function LoadingCards({ count = 2, lines = 3, label }: { count?: number; lines?: number; label: string }) {
    return (
        <div role="status" className="space-y-4">
            <span className="sr-only">{label}</span>
            {Array.from({ length: count }, (_, index) => (
                <SkeletonCard key={index} lines={lines} />
            ))}
        </div>
    )
}
