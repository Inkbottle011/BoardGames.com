import { useState } from "react";

export default function TargetingModal({ request, onResolve }) {
    const [selected, setSelected] = useState([]);
    
    if (!request) return null;
    
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
    
    function handleSkip() {
        if (type === 'pick_n') {
            onResolve([]);
        } else {
            // Auto pick random for timeout/skip
            const random = options[Math.floor(Math.random() * options.length)];
            onResolve(random.value);
        }
    }
    
    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="center-panel p-6 flex flex-col gap-4 max-w-lg w-full mx-4">
        <p className="text-lg font-bold text-center">{prompt}</p>
        
        {/* Color picker */}
        {type === 'color' && (
            <div className="flex flex-wrap gap-2 justify-center">
            {options.map((opt, i) => (
                <button
                key={i}
                className="chat-send px-4 py-2"
                style={{ backgroundColor: colorToHex(opt.value) }}
                onClick={() => handlePick(opt)}
                >
                {opt.label}
                </button>
            ))}
            </div>
        )}
        
        {/* Opponent picker */}
        {type === 'opponent' && (
            <div className="flex flex-wrap gap-2 justify-center">
            {options.map((opt, i) => (
                <button
                key={i}
                className="chat-send px-4 py-2"
                onClick={() => handlePick(opt)}
                >
                {opt.label}
                </button>
            ))}
            </div>
        )}
        
        {/* Card picker */}
        {type === 'card' && (
            <div className="flex flex-wrap gap-2 justify-center overflow-y-auto max-h-64">
            {options.map((opt, i) => (
                <div
                key={i}
                className="game-card cursor-pointer hover:opacity-80"
                style={{ width: '5rem', height: '7rem' }}
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
        
        {/* Yes/No */}
        {type === 'yes_no' && (
            <div className="flex gap-4 justify-center">
            <button className="chat-send px-6 py-2" onClick={() => onResolve(true)}>Yes</button>
            <button className="chat-send px-6 py-2 opacity-60" onClick={() => onResolve(false)}>No</button>
            </div>
        )}
        
        {/* Pick N */}
        {type === 'pick_n' && (
            <>
            <div className="flex flex-wrap gap-2 justify-center overflow-y-auto max-h-64">
            {options.map((opt, i) => (
                <div
                key={i}
                className={`game-card cursor-pointer ${selected.find(s => s.value === opt.value) ? 'ring-2 ring-yellow-400' : 'hover:opacity-80'}`}
                style={{ width: '5rem', height: '7rem' }}
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
            <div className="flex gap-4 justify-center">
            <button className="chat-send px-4 py-2" onClick={handleConfirmPickN}>
            Confirm ({selected.length} selected)
            </button>
            <button className="chat-send px-4 py-2 opacity-60" onClick={() => { onResolve([]); setSelected([]); }}>
            Skip
            </button>
            </div>
            </>
        )}
        
        {/* Age picker */}
        {type === 'age' && (
            <div className="flex flex-wrap gap-2 justify-center">
            {options.map((opt, i) => (
                <button
                key={i}
                className="chat-send px-4 py-2"
                onClick={() => handlePick(opt)}
                >
                {opt.label}
                </button>
            ))}
            </div>
        )}
        
        <button className="text-xs opacity-40 mt-2 text-center" onClick={handleSkip}>
        Skip
        </button>
        </div>
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