import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTicket, type TicketData } from '../services/api';

function TicketView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTicket = async () => {
      if (!id) {
        setError('ID listića nije pronađen');
        setLoading(false);
        return;
      }

      try {
        const data = await getTicket(id);
        setTicket(data);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Listić nije pronađen');
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id]);

  const calculateMatches = () => {
    if (!ticket || !ticket.drawnNumbers) return 0;
    return ticket.numbers.filter(num => ticket.drawnNumbers?.includes(num)).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-600">Učitavanje...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Detalji Listića</h1>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl mb-6">
            <p className="text-red-800 text-center">{error}</p>
          </div>
        </main>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Listić nije pronađen</div>
      </div>
    );
  }

  const matches = calculateMatches();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Natrag na početnu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Detalji Listića</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between py-3 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-600">ID listića:</span>
              <span className="text-sm text-gray-900 font-mono">{ticket.id}</span>
            </div>

            <div className="flex items-start justify-between py-3 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-600">Broj osobne iskaznice:</span>
              <span className="text-sm text-gray-900 font-semibold">{ticket.idNumber}</span>
            </div>

            <div className="flex items-start justify-between py-3 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-600">Datum uplate:</span>
              <span className="text-sm text-gray-900">{new Date(ticket.createdAt).toLocaleString('hr-HR')}</span>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Vaši brojevi:</h3>
            <div className="flex flex-wrap gap-3">
              {ticket.numbers.map((num, idx) => (
                <div
                  key={idx}
                  className={`w-14 h-14 flex items-center justify-center text-xl font-bold rounded-full shadow-md transition-all ${
                    ticket.drawnNumbers?.includes(num)
                      ? 'bg-green-600 text-white scale-110'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  {num}
                </div>
              ))}
            </div>
          </div>

          {ticket.drawnNumbers && ticket.drawnNumbers.length > 0 ? (
            <>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Izvučeni brojevi:</h3>
                <div className="flex flex-wrap gap-3">
                  {ticket.drawnNumbers.map((num, idx) => (
                    <div
                      key={idx}
                      className="w-14 h-14 flex items-center justify-center text-xl font-bold text-white bg-gray-700 rounded-full shadow-md"
                    >
                      {num}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Rezultat:</h3>
                <p className="text-2xl font-bold text-blue-900">
                  Pogodili ste {matches} {matches === 1 ? 'broj' : 'brojeva'}
                </p>
                {matches >= 6 && (
                  <p className="mt-2 text-sm text-blue-800">
                    Čestitamo! Ostvarili ste dobitak! 🎉
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-amber-800 text-center">
                Izvlačenje brojeva još nije obavljeno.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default TicketView;
