import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitTicket } from '../services/api';

function SubmitTicket() {
  const [idNumber, setIdNumber] = useState('');
  const [numbersInput, setNumbersInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Parsiranje brojeva
      const numbersStr = numbersInput.split(',').map(n => n.trim());
      const numbers = numbersStr.map(n => parseInt(n, 10));

      // Osnovna validacija
      if (numbers.some(isNaN)) {
        throw new Error('Svi unosi moraju biti brojevi');
      }

      // Poziv API-ja
      const qrCodeBlob = await submitTicket(idNumber, numbers);

      // Prikaz QR koda
      const imageUrl = URL.createObjectURL(qrCodeBlob);
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head>
              <title>QR Kod Listića</title>
              <style>
                body {
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  min-height: 100vh;
                  font-family: Arial, sans-serif;
                  margin: 0;
                  padding: 20px;
                  background: #f5f5f5;
                }
                h2 { color: #333; }
                img {
                  max-width: 400px;
                  border: 2px solid #333;
                  border-radius: 8px;
                  background: white;
                  padding: 20px;
                }
                p { color: #666; margin-top: 20px; }
              </style>
            </head>
            <body>
              <h2>Vaš listić je uspješno uplaćen!</h2>
              <img src="${imageUrl}" alt="QR Kod" />
              <p>Skenirajte ovaj QR kod kako biste vidjeli detalje listića</p>
            </body>
          </html>
        `);
      }

      // Reset forme
      setIdNumber('');
      setNumbersInput('');
      alert('Listić uspješno uplaćen! QR kod je prikazan u novom prozoru.');
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Došlo je do greške');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Uplata Listića</h1>

      <button onClick={() => navigate('/')} className="btn btn-secondary">
        ← Natrag
      </button>

      <form onSubmit={handleSubmit} className="ticket-form">
        <div className="form-group">
          <label htmlFor="idNumber">Broj osobne iskaznice / putovnice:</label>
          <input
            type="text"
            id="idNumber"
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value)}
            maxLength={20}
            required
            placeholder="Unesite broj dokumenta (max 20 znakova)"
          />
        </div>

        <div className="form-group">
          <label htmlFor="numbers">Brojevi (6-10 brojeva, odvojeni zarezom):</label>
          <input
            type="text"
            id="numbers"
            value={numbersInput}
            onChange={(e) => setNumbersInput(e.target.value)}
            required
            placeholder="npr: 1, 5, 12, 23, 34, 45"
          />
          <small>Unesite 6 do 10 brojeva u rasponu od 1 do 45, odvojenih zarezom</small>
        </div>

        {error && <div className="error">{error}</div>}

        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? 'Slanje...' : 'Uplati listić'}
        </button>
      </form>
    </div>
  );
}

export default SubmitTicket;
