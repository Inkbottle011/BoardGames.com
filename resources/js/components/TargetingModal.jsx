import { useState } from "react";

export default function TargetingModal({ request, onResolve }) {
    const [selected, setSelected] = useState([]);

    if (!request) return (
        <p style={{ fontSize: '0.7rem', opacity: 0.3 }}>Action prompts will appear here</p>
    );

    const { type, prompt, options, max } = request;

    function handlePick(option) {
        if (type === 'pick_n') {
            const already = selected.find(s => s.value === option.value);
            if (already) {
                setSelected(selected.filter(s => s.value !== option.value));
            } else if (selected.length < max) {
                setSelected([...selected, option]);
            }
        } else {
            onResolve(option.value);
        }
    }

    function handleConfirmPickN() {
        onResolve(selected.map(s => s.value));
        setSelected([]);
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: 'var(--nature-yellow)', fontWeight: 'bold', textAlign: 'center', fontSize: '0.85rem' }}>
                {prompt}
            </p>

            {/* Yes/No */}
            {(type === 'yes_no') && (
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {options.map((opt, i) => (
                        <button
                            key={i}
                            className="chat-send"
                            style={{ padding: '0.4rem 1.2rem' }}
                            onClick={() => onResolve(opt.value)}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Color picker */}
            {type === 'color' && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
                    {options.map((opt, i) => (
                        <button
                            key={i}
                            className="chat-send"
                            style={{ backgroundColor: colorToHex(opt.value), padding: '0.4rem 1rem' }}
                            onClick={() => handlePick(opt)}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Opponent picker */}
            {type === 'opponent' && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
                    {options.map((opt, i) => (
                        <button
                            key={i}
                            className="chat-send"
                            style={{ padding: '0.4rem 1rem' }}
                            onClick={() => handlePick(opt)}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Card picker */}
            {type === 'card' && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', overflowY: 'auto', maxHeight: '7rem' }}>
                    {options.map((opt, i) => (
                        <div
                            key={i}
                            className="game-card"
                            style={{ width: '4rem', height: '5.6rem', cursor: 'pointer' }}
                            onClick={() => handlePick(opt)}
                        >
                            <img
                                src={opt.card?.img ? `/${opt.card.img}` : '/images/card_not_found.png'}
                                alt={opt.label}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => { e.target.src = '/images/card_not_found.png'; }}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Pick N */}
            {type === 'pick_n' && (
                <>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', overflowY: 'auto', maxHeight: '7rem' }}>
                        {options.map((opt, i) => (
                            <div
                                key={i}
                                className="game-card"
                                style={{
                                    width: '4rem', height: '5.6rem', cursor: 'pointer',
                                    outline: selected.find(s => s.value === opt.value) ? '2px solid var(--nature-yellow)' : 'none',
                                }}
                                onClick={() => handlePick(opt)}
                            >
                                <img
                                    src={opt.card?.img ? `/${opt.card.img}` : '/images/card_not_found.png'}
                                    alt={opt.label}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => { e.target.src = '/images/card_not_found.png'; }}
                                />
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button className="chat-send" style={{ padding: '0.4rem 1rem' }} onClick={handleConfirmPickN}>
                            Confirm ({selected.length} selected)
                        </button>
                        <button className="chat-send" style={{ padding: '0.4rem 1rem', opacity: 0.6 }} onClick={() => { onResolve([]); setSelected([]); }}>
                            Skip
                        </button>
                    </div>
                </>
            )}

            {/* Age picker */}
            {type === 'age' && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
                    {options.map((opt, i) => (
                        <button
                            key={i}
                            className="chat-send"
                            style={{ padding: '0.4rem 1rem' }}
                            onClick={() => handlePick(opt)}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}

            {type !== 'pick_n' && (
                <button
                    style={{ fontSize: '0.65rem', opacity: 0.4, marginTop: '0.25rem', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
                    onClick={() => {
                        if (type === 'pick_n') onResolve([]);
                        else {
                            const random = options[Math.floor(Math.random() * options.length)];
                            onResolve(random.value);
                        }
                    }}
                >
                    Skip
                </button>
            )}
        </div>
    );
}

function colorToHex(color) {
    const map = {
        Green: '#2d6a2d',
        Blue: '#1a4a7a',
        Red: '#7a1a1a',
        Purple: '#4a1a7a',
        Colorless: '#555',
    };
    return map[color] ?? '#333';
}