import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import SubmitTicket from './pages/SubmitTicket';
import TicketView from './pages/TicketView';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/uplata" element={<SubmitTicket />} />
        <Route path="/ticket/:id" element={<TicketView />} />
      </Routes>
    </Router>
  );
}

export default App
