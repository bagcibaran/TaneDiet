import { useTranslation } from 'react-i18next'

import DietitianAvatar from './DietitianAvatar'
import { ABOUT, TONE_CLASSES, localize } from '../../landing/content'

// Hakkımda: iki cümle ve uzmanlık etiketleri
function AboutCard() {
    const { i18n } = useTranslation()
    return (
        <div className="rounded-3xl bg-card p-5 shadow-soft">
            <div className="flex items-center gap-3">
                <DietitianAvatar size={52} />
                <h2 className="text-xl font-extrabold tracking-tight text-ink">{localize(ABOUT.title, i18n.language)}</h2>
            </div>
            <p className="mt-3 text-muted">{localize(ABOUT.text, i18n.language)}</p>
            <ul className="mt-3 flex flex-wrap gap-2">
                {ABOUT.tags.map((tag) => (
                    <li key={tag.label.tr} className={`rounded-full px-3 py-1 text-xs font-bold ${TONE_CLASSES[tag.tone]}`}>
                        {localize(tag.label, i18n.language)}
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default AboutCard
