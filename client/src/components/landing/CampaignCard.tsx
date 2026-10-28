import { CAMPAIGN } from '../../landing/content'

// Parlayan altın kampanya kartı
function CampaignCard() {
    return (
        <div className="relative overflow-hidden rounded-3xl p-5 text-ink shadow-soft shine-gold">
            <span className="inline-block rounded-full bg-ink px-2.5 py-0.5 text-[0.7rem] font-extrabold tracking-wide text-honey">
                {CAMPAIGN.tag}
            </span>
            <p className="mt-2 text-2xl font-extrabold tracking-tight">{CAMPAIGN.title}</p>
            <p className="mt-1 text-sm">{CAMPAIGN.text}</p>
            {/* Süs: büyük, soluk yüzde işareti */}
            <span aria-hidden="true" className="pointer-events-none absolute -bottom-10 -right-2 text-[7rem] font-extrabold opacity-15">
                %
            </span>
        </div>
    )
}

export default CampaignCard
