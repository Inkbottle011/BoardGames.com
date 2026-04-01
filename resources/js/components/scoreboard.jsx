export default function Scoreboard({ players, currentTurn }) {
    return (
        <div className="scoreboard">
        <h3 className="scoreboard-title">Scoreboard</h3>
        {players.map((player, i) => (
            <div
            key={player.id}
            className={`score-row ${player.id === currentTurn ? 'current-turn' : ''}`}
            >
            <div className="flex items-center gap-2">
            {player.id === currentTurn && (
                <span style={{ color: 'var(--nature-yellow)', fontSize: '0.5rem' }}>▶</span>
            )}
            <span>Player {i + 1}</span>
            </div>
            <div className="flex gap-3 text-xs opacity-70">
            <span>🧬 {player.genepool}</span>
            <span className="score-points">{player.points}pts</span>
            </div>
            </div>
        ))}
        </div>
    );
}