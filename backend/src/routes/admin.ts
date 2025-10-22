import express from 'express';
import type { Request, Response } from 'express';
import pool from '../database/db.js';
import { checkJwt } from '../middleware/auth.js';
import { validateDrawnNumbers } from '../utils/validation.js';

const router = express.Router();

// POST /new-round - Aktivira novo kolo
router.post('/new-round', checkJwt, async (_req: Request, res: Response) => {
  try {
    // Deaktiviraj sve postojeće aktivne runde
    await pool.query('UPDATE rounds SET is_active = false WHERE is_active = true');

    // Kreiraj novu rundu
    await pool.query('INSERT INTO rounds (is_active) VALUES (true)');

    res.status(204).send();
  } catch (error) {
    console.error('Error creating new round:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /close - Zatvara trenutno kolo
router.post('/close', checkJwt, async (_req: Request, res: Response) => {
  try {
    await pool.query('UPDATE rounds SET is_active = false WHERE is_active = true');
    res.status(204).send();
  } catch (error) {
    console.error('Error closing round:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /store-results - Sprema izvučene brojeve
router.post('/store-results', checkJwt, async (req: Request, res: Response) => {
  try {
    const { numbers } = req.body;

    if (!numbers || !Array.isArray(numbers)) {
      return res.status(400).json({ error: 'Invalid numbers format' });
    }

    const validation = validateDrawnNumbers(numbers);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    // Provjeri postoji li trenutno kolo i je li zatvoreno
    const roundResult = await pool.query(
      'SELECT id, is_active, drawn_numbers FROM rounds ORDER BY id DESC LIMIT 1'
    );

    if (roundResult.rows.length === 0) {
      return res.status(400).json({ error: 'No round exists' });
    }

    const currentRound = roundResult.rows[0];

    // Provjeri je li kolo zatvoreno (uplate deaktivirane)
    if (currentRound.is_active) {
      return res.status(400).json({ error: 'Round is still active' });
    }

    // Provjeri jesu li već izvučeni brojevi
    if (currentRound.drawn_numbers && currentRound.drawn_numbers.length > 0) {
      return res.status(400).json({ error: 'Numbers already drawn for this round' });
    }

    // Spremi izvučene brojeve
    await pool.query(
      'UPDATE rounds SET drawn_numbers = $1 WHERE id = $2',
      [numbers, currentRound.id]
    );

    res.status(204).send();
  } catch (error) {
    console.error('Error storing results:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
