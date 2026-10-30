type LegalTextProps = {
    text: string
}

// Backend'deki KVKK metnini çizer: "## " ile başlayan blok başlık, diğerleri paragraf (tek satır sonları korunur)
function LegalText({ text }: LegalTextProps) {
    const blocks = text
        .split(/\n\s*\n/)
        .map((block) => block.trim())
        .filter((block) => block.length > 0)

    return (
        <div className="space-y-3 text-sm leading-relaxed text-ink">
            {blocks.map((block, index) =>
                block.startsWith('## ') ? (
                    <h2 key={index} className="pt-3 text-lg font-extrabold tracking-tight first:pt-0">
                        {block.slice(3)}
                    </h2>
                ) : (
                    <p key={index} className="whitespace-pre-line text-muted">
                        {block}
                    </p>
                ),
            )}
        </div>
    )
}

export default LegalText
