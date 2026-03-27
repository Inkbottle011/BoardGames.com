export default function Card({ card, onPlay }) {
    return (
        <div className="w-28 h-40 bg-white rounded-2xl shadow-xl p-2 flex flex-col justify-between hover:scale-105 transition">
            {/*Name*/}
            <h4 className="text-sm font bold text-gray-800">
                {card.card_name}
            </h4>

            {/*image*/}
            <div className="flex-1 flex items-center justify-center">
                <img
                    src={card.image_url}
                    alt={card.card_namename}
                    className="max-h-16 objects-contain"
                />
            </div>

            {/*points*/}
            <div className="text-xs text-gray-600 text-right">
                {card.points}pts
            </div>
        </div>
    );
}
