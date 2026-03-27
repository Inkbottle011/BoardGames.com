export default function Deck({ deckSize, discardPile }) {
    const topDiscard = discardPile && discardPile.length > 0
    ? discardPile[discardPile.length - 1]
    : null;
    
    return (
        <div className="flex gap-6 items-center justify-center">
        <div className="flex flex-col items-center gap-1">
        <div className="w-20 h-28 bg-green-700 border-2 border-green-900 rounded-xl shadow-xl flex items-center justify-center">
        <span className="text-white font-bold text-lg">{deckSize}</span>
        </div>
        <p className="text-xs text-gray-500">Draw Pile</p>
        </div>
        
        <div className="flex flex-col items-center gap-1">
        {topDiscard ? (
            <div className="w-20 h-28 bg-white border-2 border-gray-300 rounded-xl shadow-xl p-2 flex flex-col justify-between">
            <p className="text-xs font-bold text-gray-800">{topDiscard.card_name}</p>
            <p className="text-xs text-gray-500 text-right">{topDiscard.points}pts</p>
            </div>
        ) : (
            <div className="w-20 h-28 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center">
            <span className="text-xs text-gray-400">Empty</span>
            </div>
        )}
        <p className="text-xs text-gray-500">Discard Pile</p>
        </div>
        </div>
    );
}