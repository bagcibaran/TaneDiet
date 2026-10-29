import { useEffect } from 'react'

const BRAND = 'tane. online diyet'

// Tarayıcı sekmesinin başlığı: "Menüm · tane." (başlık verilmezse marka adı)
export function usePageTitle(title?: string | null) {
    useEffect(() => {
        document.title = title ? `${title} · tane.` : BRAND
        return () => {
            document.title = BRAND
        }
    }, [title])
}
