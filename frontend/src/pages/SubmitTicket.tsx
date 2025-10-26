import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitTicket } from '../services/api';

function SubmitTicket() {
  const [idNumber, setIdNumber] = useState('');
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

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
      setError('Unesite broj osobne iskaznice');
      return;
    }

    if (selectedNumbers.length < 6) {
      setError('Morate odabrati najmanje 6 brojeva');
      return;
    }

    setSubmitting(true);

    try {
      const pdfBlob = await submitTicket(idNumber, selectedNumbers);

      // Download PDF
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `loto-ticket-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Navigate home
      navigate('/');
    } catch (err: any) {
      console.error('Submit error:', err);
      setError(err.response?.data?.error || 'Greška pri slanju listica');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* ID Number Input */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <label htmlFor="idNumber" className="block text-sm font-semibold text-gray-900 mb-3">
              Broj osobne iskaznice
            </label>
            <input
              type="text"
              id="idNumber"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              placeholder="Unesite broj osobne iskaznice"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Number Picker */}
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

            {/* Number Grid */}
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

            {/* Selected Numbers Display */}
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

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-800 text-center">{error}</p>
            </div>
          )}

          {/* Submit Button */}
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
