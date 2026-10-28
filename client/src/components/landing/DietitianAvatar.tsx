type DietitianAvatarProps = {
    size?: number
}

// Diyetisyenin YER TUTUCU çizimi (gerçek bir kişinin fotoğrafı değil).
// Gerçek fotoğraf gelince yalnızca bu dosya değişir: public/ klasörüne resmi koyup burada <img> döndürmek yeterli.
function DietitianAvatar({ size = 64 }: DietitianAvatarProps) {
    return (
        <span
            className="inline-block shrink-0 animate-pop overflow-hidden rounded-full border-[3px] border-honey bg-sage"
            style={{ width: size, height: size }}
        >
            <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true">
                <path d="M14 64c2-14 10-20 18-20s16 6 18 20z" fill="var(--color-brand)" />
                <circle cx="32" cy="28" r="12" fill="#f2c9a0" />
                <path d="M19 30c-2-12 5-19 13-19s15 6 13 19c-2-6-6-10-13-10s-11 4-13 10z" fill="#5a3825" />
            </svg>
        </span>
    )
}

export default DietitianAvatar
