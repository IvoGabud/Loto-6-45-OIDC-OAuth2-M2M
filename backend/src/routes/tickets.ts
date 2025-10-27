import express from 'express';
import type { Request, Response } from 'express';
import QRCode from 'qrcode';
import pool from '../database/db.js';
import { validateTicket } from '../utils/validation.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const { idNumber, numbers } = req.body;
    console.log('=== TICKET SUBMISSION ===');
    console.log('idNumber:', idNumber);
    console.log('numbers:', numbers);
    console.log('numbers type:', typeof numbers);

    const validation = validateTicket(idNumber, numbers);
    console.log('Validation result:', validation);
    if (!validation.valid) {
      console.log('Validation failed:', validation.error);
      return res.status(400).json({ error: validation.error });
    }

    const roundResult = await pool.query(
      'SELECT id FROM rounds WHERE is_active = true ORDER BY id DESC LIMIT 1'
    );

    if (roundResult.rows.length === 0) {
      return res.status(400).json({ error: 'Uplate nisu trenutno omogućene' });
    }

    const roundId = roundResult.rows[0].id;

    const ticketResult = await pool.query(
      'INSERT INTO tickets (round_id, id_number, numbers) VALUES ($1, $2, $3) RETURNING id',
      [roundId, idNumber.trim(), numbers]
    );

    const ticketId = ticketResult.rows[0].id;

    const ticketUrl = `${process.env.FRONTEND_URL}/ticket/${ticketId}`;
    console.log('Generated QR code for URL:', ticketUrl);
    const qrCode = await QRCode.toBuffer(ticketUrl, { type: 'png' });

    res.setHeader('Content-Type', 'image/png');
    res.send(qrCode);
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT t.id, t.id_number, t.numbers, t.created_at, r.drawn_numbers
       FROM tickets t
       JOIN rounds r ON t.round_id = r.id
       WHERE t.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Listić nije pronađen' });
    }

    const ticket = result.rows[0];
    res.json({
      id: ticket.id,
      idNumber: ticket.id_number,
      numbers: ticket.numbers,
      drawnNumbers: ticket.drawn_numbers || null,
      createdAt: ticket.created_at
    });
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
