import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentRound, getCurrentUser, login, logout, type User, type CurrentRoundData } from '../services/api';

function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [roundData, setRoundData] = useState<CurrentRoundData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userData, round] = await Promise.all([
          getCurrentUser(),
          getCurrentRound()
        ]);
        setUser(userData);
        setRoundData(round);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  if (loading) {
    return <div className="container">Učitavanje...</div>;
  }

  return (
    <div className="container">
      <h1>Loto 6/45</h1>

      {/* User info */}
      <div className="user-section">
        {user ? (
          <div>
            <p>Prijavljeni ste kao: <strong>{user.email || user.name}</strong></p>
            <button onClick={handleLogout} className="btn btn-secondary">
              Odjava
            </button>
          </div>
        ) : (
          <button onClick={login} className="btn btn-primary">
            Prijava
          </button>
        )}
      </div>

      {/* Round info */}
      <div className="round-info">
        <h2>Trenutno kolo</h2>
        {roundData?.exists ? (
          <>
            <p>
              <strong>Broj uplaćenih listića:</strong> {roundData.ticketCount}
            </p>

            {roundData.drawnNumbers && roundData.drawnNumbers.length > 0 && (
              <div className="drawn-numbers">
                <h3>Izvučeni brojevi:</h3>
                <div className="numbers">
                  {roundData.drawnNumbers.map((num, idx) => (
                    <span key={idx} className="number-ball">{num}</span>
                  ))}
                </div>
              </div>
            )}

            {roundData.isActive && user && (
              <button
                onClick={() => navigate('/uplata')}
                className="btn btn-primary"
              >
                Uplati listić
              </button>
            )}

            {!roundData.isActive && !roundData.drawnNumbers && (
              <p className="info">Uplate su trenutno zatvorene. Očekuje se izvlačenje brojeva.</p>
            )}

            {!roundData.isActive && !user && (
              <p className="info">Prijavite se kako biste mogli uplatiti listić kada se uplate otvore.</p>
            )}

            {!roundData.isActive && user && (
              <p className="info">Uplate su trenutno zatvorene. Čeka se aktiviranje novog kola.</p>
            )}
          </>
        ) : (
          <p className="info">Trenutno nema aktivnog kola. Administrator treba aktivirati novo kolo.</p>
        )}
      </div>
    </div>
  );
}

export default Home;
