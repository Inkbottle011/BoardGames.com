export default function PlayerArea({ player, label, isYou }) {
    if (!player) return null;

    return (
        <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-lg w-20 text-center border">
            <h3 className="font-semibold text-gray-700">
                {isYou ? "You" : player.name || "Player"}
            </h3>

            <p className="text-xs text-gray-500">
                {player.hand?.length ?? 0} cards
            </p>

            {isYou && (
                <div className="mt-2 text-xs text-gray-400">Your Traits</div>
            )}

            <div className="flex flex-wrap justify-center gap-2 mt-2">
                {player.colors?.map((color) => (
                    <div
                        key={color.id}
                        className="bg-red-500 text-white text-xs px-2 py-1 rounded-full shadow"
                    >
                        {color.card_name}
                    </div>
                ))}
            </div>

            {isYou && player.colors && player.colors.length > 0 && (
                <div className="mt-2 text-xs text-gray-400">Your Colors</div>
            )}
        </div>
    );
}
