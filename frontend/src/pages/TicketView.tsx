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
    return <div className="container">Učitavanje...</div>;
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">{error}</div>
        <button onClick={() => navigate('/')} className="btn btn-secondary">
          ← Natrag na početnu
        </button>
      </div>
    );
  }

  if (!ticket) {
    return <div className="container">Listić nije pronađen</div>;
  }

  const matches = calculateMatches();

  return (
    <div className="container">
      <h1>Detalji Listića</h1>

      <div className="ticket-details">
        <div className="detail-row">
          <strong>ID listića:</strong>
          <span>{ticket.id}</span>
        </div>

        <div className="detail-row">
          <strong>Broj osobne iskaznice:</strong>
          <span>{ticket.idNumber}</span>
        </div>

        <div className="detail-row">
          <strong>Datum uplate:</strong>
          <span>{new Date(ticket.createdAt).toLocaleString('hr-HR')}</span>
        </div>

        <div className="numbers-section">
          <h3>Vaši brojevi:</h3>
          <div className="numbers">
            {ticket.numbers.map((num, idx) => (
              <span
                key={idx}
                className={`number-ball ${
                  ticket.drawnNumbers?.includes(num) ? 'matched' : ''
                }`}
              >
                {num}
              </span>
            ))}
          </div>
        </div>

        {ticket.drawnNumbers && ticket.drawnNumbers.length > 0 ? (
          <>
            <div className="numbers-section">
              <h3>Izvučeni brojevi:</h3>
              <div className="numbers">
                {ticket.drawnNumbers.map((num, idx) => (
                  <span key={idx} className="number-ball drawn">
                    {num}
                  </span>
                ))}
              </div>
            </div>

            <div className="results">
              <h3>Rezultat:</h3>
              <p className="matches">
                Pogodili ste <strong>{matches}</strong> {matches === 1 ? 'broj' : 'brojeva'}
              </p>
            </div>
          </>
        ) : (
          <div className="info">
            <p>Izvlačenje brojeva još nije obavljeno.</p>
          </div>
        )}
      </div>

      <button onClick={() => navigate('/')} className="btn btn-secondary">
        ← Natrag na početnu
      </button>
    </div>
  );
}

export default TicketView;
