import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitTicket, getCurrentUser, getCurrentRound } from '../services/api';

function SubmitTicket() {
  const [idNumber, setIdNumber] = useState('');
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await getCurrentUser();
        if (!userData) {
          // User is not authenticated, redirect to home
          navigate('/');
        } else {
          setLoading(false);
        }
      } catch (error) {
        // Error fetching user, redirect to home
        navigate('/');
      }
    };

    checkAuth();
  }, [navigate]);

  const toggleNumber = (num: number) => {
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter(n => n !== num));
    } else {
      if (selectedNumbers.length < 10) {
        setSelectedNumbers([...selectedNumbers, num].sort((a, b) => a - b));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!idNumber.trim()) {
      setError('Unesite broj osobne iskaznice ili putovnice');
      return;
    }

    if (idNumber.length > 20) {
      setError('Broj osobne iskaznice ili putovnice ne može biti duži od 20 znamenki');
      return;
    }

    if (selectedNumbers.length < 6) {
      setError('Morate odabrati najmanje 6 brojeva');
      return;
    }

    setSubmitting(true);

    try {
      // Check if round is still active before submitting
      const roundData = await getCurrentRound();
      if (!roundData.exists || !roundData.isActive) {
        setError('Uplate su zatvorene. Trenutno nije moguće uplatiti listić.');
        setSubmitting(false);
        return;
      }

      const qrBlob = await submitTicket(idNumber, selectedNumbers);

      const url = window.URL.createObjectURL(qrBlob);
      setQrCodeUrl(url);
    } catch (err: any) {
      console.error('Submit error:', err);
      setError(err.response?.data?.error || 'Greška pri slanju listica');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownload = () => {
    if (!qrCodeUrl) return;

    const a = document.createElement('a');
    a.href = qrCodeUrl;
    a.download = `loto-ticket-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleNewTicket = () => {
    if (qrCodeUrl) {
      window.URL.revokeObjectURL(qrCodeUrl);
    }
    setQrCodeUrl(null);
    setIdNumber('');
    setSelectedNumbers([]);
    setError('');
  };

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-600">Učitavanje...</div>
      </div>
    );
  }

  if (qrCodeUrl) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold text-gray-900 text-center">Listić uspješno uplaćen!</h1>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Vaš listić je uspješno uplaćen</h2>
              <p className="text-gray-600">Skenirajte QR kod kako biste kasnije provjerili rezultate</p>
            </div>

            <div className="flex justify-center py-6">
              <div className="bg-white p-4 rounded-xl border-2 border-gray-200 shadow-sm">
                <img src={qrCodeUrl} alt="Ticket QR Code" className="w-64 h-64" />
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <p className="text-sm font-medium text-gray-700 mb-3 text-center">Vaši odabrani brojevi:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {selectedNumbers.map((num) => (
                  <div
                    key={num}
                    className="w-10 h-10 flex items-center justify-center text-sm font-bold text-white bg-blue-600 rounded-full"
                  >
                    {num}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <button
                onClick={handleDownload}
                className="w-full px-6 py-3.5 text-base font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
              >
                Preuzmi QR kod
              </button>
              <button
                onClick={handleNewTicket}
                className="w-full px-6 py-3.5 text-base font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Uplati novi listić
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full px-6 py-3.5 text-base font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Povratak na početnu
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold text-gray-900">Uplati listić</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <label htmlFor="idNumber" className="block text-sm font-semibold text-gray-900 mb-3">
              Broj osobne iskaznice ili putovnice
            </label>
            <input
              type="text"
              id="idNumber"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              placeholder="Unesite broj osobne iskaznice ili putovnice"
              maxLength={20}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {idNumber.length >= 20 && (
              <p className="mt-2 text-sm text-amber-600">
                Maksimalna duljina je 20 znamenki
              </p>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Odaberite brojeve
              </h2>
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-blue-600">{selectedNumbers.length}</span> / 10 odabrano
              </div>
            </div>

            {selectedNumbers.length >= 6 && (
              <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm text-blue-800 text-center">
                  Možete odabrati između 6 i 10 brojeva
                </p>
              </div>
            )}

            <div className="grid grid-cols-5 sm:grid-cols-9 gap-2 mb-6">
              {Array.from({ length: 45 }, (_, i) => i + 1).map((num) => {
                const isSelected = selectedNumbers.includes(num);
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => toggleNumber(num)}
                    disabled={!isSelected && selectedNumbers.length >= 10}
                    className={`
                      aspect-square flex items-center justify-center rounded-xl text-lg font-semibold transition-all
                      ${isSelected
                        ? 'bg-blue-600 text-white shadow-md scale-105'
                        : 'bg-gray-50 text-gray-900 border border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                      }
                      ${!isSelected && selectedNumbers.length >= 10 ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    {num}
                  </button>
                );
              })}
            </div>

            {selectedNumbers.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Odabrani brojevi:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedNumbers.map((num) => (
                    <div
                      key={num}
                      className="w-10 h-10 flex items-center justify-center text-sm font-bold text-white bg-blue-600 rounded-full"
                    >
                      {num}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-800 text-center">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || selectedNumbers.length < 6}
            className="w-full px-6 py-4 text-lg font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-sm hover:shadow-md"
          >
            {submitting ? 'Slanje...' : 'Uplati listić'}
          </button>
        </form>
      </main>
    </div>
  );
}

export default SubmitTicket;
