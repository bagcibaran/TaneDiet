import DietitianAvatar from './DietitianAvatar'
import { ABOUT, TONE_CLASSES } from '../../landing/content'

// Hakkımda: iki cümle ve uzmanlık etiketleri
function AboutCard() {
    return (
        <div className="rounded-3xl bg-card p-5 shadow-soft">
            <div className="flex items-center gap-3">
                <DietitianAvatar size={52} />
                <h2 className="text-xl font-extrabold tracking-tight text-ink">{ABOUT.title}</h2>
            </div>
            <p className="mt-3 text-muted">{ABOUT.text}</p>
            <ul className="mt-3 flex flex-wrap gap-2">
                {ABOUT.tags.map((tag) => (
                    <li key={tag.label} className={`rounded-full px-3 py-1 text-xs font-bold ${TONE_CLASSES[tag.tone]}`}>
                        {tag.label}
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default AboutCard
