export default function PlayerArea({ player, label, isYou }) {
    if (!player) return null;

    return (
        <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-lg w-32 text-center border">
            <h3 className="font-semibold text-gray-700">{label}</h3>

            <div className="flex flex-wrap justify-center gap-2 mt-2">
                {player.traits?.map((trait) => (
                    <div
                        key={trait.id}
                        className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full shadow"
                    >
                        {trait.name}
                    </div>
                ))}
            </div>

            {isYou && (
                <div className="mt-2 text-xs text-gray-400">Your Traits</div>
            )}
        </div>
    );
}
