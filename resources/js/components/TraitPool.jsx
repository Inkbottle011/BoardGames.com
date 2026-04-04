const COLOR_ORDER = ['Green', 'Blue', 'Red', 'Purple', 'Colorless'];

const COLOR_BORDER = {
    Green: '#4a7c4a',
    Blue: '#1a4a7a',
    Red: '#7a1a1a',
    Purple: '#4a1a7a',
    Colorless: '#555',
};

export default function TraitPool({ traitpool, small = false, onHover, size, isActive }) {
    if (!traitpool || traitpool.length === 0) return null;

    const cardWidth = size ?? (small ? 40 : 56);
    const cardHeight = Math.round(cardWidth * 1.4);
    const offsetPerCard = Math.floor(cardWidth / 2);

    const grouped = {};
    COLOR_ORDER.forEach(color => {
        grouped[color] = traitpool.filter(t => t && t.color === color);
    });

    const colorGroups = COLOR_ORDER.filter(color => grouped[color]?.length > 0);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '0.75rem',
            flexWrap: 'nowrap',
            overflowX: 'auto',
            padding: '0.25rem 0.5rem',
            width: '100%',
            justifyContent: 'center',
            outline: isActive ? '2px solid var(--nature-yellow)' : 'none',
outlineOffset: '4px',
borderRadius: '8px',
transition: 'outline 0.2s',
        }}>
            {colorGroups.map(color => {
                const cards = grouped[color];
                const stackWidth = cardWidth + (cards.length - 1) * offsetPerCard;

                return (
                    <div key={color} style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.2rem',
                        flexShrink: 0,
                    }}>
                        <div style={{
                            position: 'relative',
                            width: `${stackWidth}px`,
                            height: `${cardHeight}px`,
                        }}>
                            {cards.map((card, i) => (
                                <div
                                    key={`${card.id}-${i}`}
                                    title={card.card_name}
                                    style={{
                                        position: 'absolute',
                                        left: `${i * offsetPerCard}px`,
                                        top: 0,
                                        width: `${cardWidth}px`,
                                        height: `${cardHeight}px`,
                                        borderRadius: '6px',
                                        overflow: 'hidden',
                                        border: `2px solid ${COLOR_BORDER[color] ?? '#555'}`,
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                                        zIndex: i,
                                        cursor: 'pointer',
                                    }}
                                    onMouseEnter={() => onHover && onHover(card)}
                                    onMouseLeave={() => onHover && onHover(null)}
                                >
                                    <img
                                        src={card.img ? `/${card.img}` : '/images/card_not_found.png'}
                                        alt={card.card_name}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        onError={(e) => { e.target.src = '/images/card_not_found.png'; }}
                                    />
                                </div>
                            ))}
                        </div>
                        <span style={{
                            fontSize: '0.6rem',
                            color: 'white',
                            background: COLOR_BORDER[color],
                            borderRadius: '4px',
                            padding: '1px 5px',
                            whiteSpace: 'nowrap',
                        }}>
                            {color[0]} {cards.length}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}