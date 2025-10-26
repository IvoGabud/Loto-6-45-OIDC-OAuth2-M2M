import express from 'express';
import type { Request, Response } from 'express';
import pool from '../database/db.js';

const router = express.Router();

router.get('/current', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT id, is_active, drawn_numbers, created_at FROM rounds ORDER BY id DESC LIMIT 1'
    );

    if (result.rows.length === 0) {
      return res.json({
        exists: false,
        isActive: false,
        drawnNumbers: null,
        ticketCount: 0
      });
    }

    const round = result.rows[0];

    const countResult = await pool.query(
      'SELECT COUNT(*) as count FROM tickets WHERE round_id = $1',
      [round.id]
    );

    res.json({
      exists: true,
      isActive: round.is_active,
      drawnNumbers: round.drawn_numbers || null,
      ticketCount: parseInt(countResult.rows[0].count, 10)
    });
  } catch (error) {
    console.error('Error fetching current round:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
