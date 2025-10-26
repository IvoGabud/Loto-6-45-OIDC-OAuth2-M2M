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
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-600">Učitavanje...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Loto 6/45</h1>

            {user ? (
              <div className="flex items-center gap-4">
                {user.picture && (
                  <img
                    src={user.picture}
                    alt={user.name || 'User'}
                    className="w-10 h-10 rounded-full border-2 border-gray-200"
                  />
                )}
                <span className="text-sm text-gray-600">
                  {user.email || user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Odjava
                </button>
              </div>
            ) : (
              <button
                onClick={login}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Prijava
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Trenutno kolo</h2>

          {roundData?.exists ? (
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-gray-700">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="font-medium">Uplaćeno listića:</span>
                <span className="font-bold text-red-600">{roundData.ticketCount}</span>
              </div>

              {roundData.drawnNumbers && roundData.drawnNumbers.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Izvučeni brojevi:</h3>
                  <div className="flex flex-wrap gap-3">
                    {roundData.drawnNumbers.map((num, idx) => (
                      <div
                        key={idx}
                        className="w-14 h-14 flex items-center justify-center text-xl font-bold text-white bg-red-600 rounded-full shadow-md"
                      >
                        {num}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4">
                {roundData.isActive && user ? (
                  <button
                    onClick={() => navigate('/uplata')}
                    className="w-full px-6 py-3.5 text-base font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors shadow-sm hover:shadow-md"
                  >
                    Uplati listić
                  </button>
                ) : !roundData.isActive && !user ? (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-800 text-center">
                      Prijavite se kako biste mogli uplatiti listić kada se uplate otvore.
                    </p>
                  </div>
                ) : !roundData.isActive && user ? (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <p className="text-amber-800 text-center">
                      Uplate su trenutno zatvorene. {roundData.drawnNumbers ? 'Čeka se aktiviranje novog kola.' : 'Očekuje se izvlačenje brojeva.'}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="p-6 bg-gray-50 border border-gray-200 rounded-xl">
              <p className="text-gray-700 text-center">
                Trenutno nema aktivnog kola. Administrator treba aktivirati novo kolo.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Home;
