export default function Card({ card, onPlay }) {
    return (
        <div className="w-28 h-40 bg-white rounded-2xl shadow-xl p-2 flex flex-col justify-between hover:scale-105 transition">
        {/*Name*/}
        <h4 className="text-sm font bold text-gray-800">
        {card.card_name}
        </h4>
        
        <img
        src={card.image_url || '/images/card_not_found.png'}
        alt={card.card_name}
        className="max-h-16 object-contain"
        onError={(e) => { e.target.src = '/images/card_not_found.png'; }}
        />
        
        {/*points*/}
        <div className="text-xs text-gray-600 text-right">
        {card.points}pts
        </div>
        </div>
    );
}
