import { Router, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Bill } from '../entities/Bill';
import { BillTick } from '../entities/BillTick';
import { User } from '../entities/User';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
const billRepo = AppDataSource.getRepository(Bill);
const tickRepo = AppDataSource.getRepository(BillTick);
const userRepo = AppDataSource.getRepository(User);

router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const bills = await billRepo.find({
      relations: ['creator', 'ticks', 'ticks.user'],
      order: { created_at: 'DESC' },
    });

    const result = bills.map((bill) => ({
      id: bill.id,
      title: bill.title,
      amount: parseFloat(bill.amount as any),
      creator: { id: bill.creator.id, name: bill.creator.name },
      created_at: bill.created_at,
      ticks: bill.ticks.map((tick) => ({
        user_id: tick.user_id,
        user_name: tick.user.name,
        ticked_at: tick.ticked_at,
      })),
    }));

    res.json({ bills: result });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bills' });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { title, amount } = req.body;

    if (!title || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const bill = billRepo.create({
      title,
      amount,
      creator_id: req.userId!,
    });
    await billRepo.save(bill);

    const creator = await userRepo.findOne({ where: { id: req.userId } });

    res.json({
      bill: {
        id: bill.id,
        title: bill.title,
        amount: parseFloat(bill.amount as any),
        creator: { id: creator!.id, name: creator!.name },
        created_at: bill.created_at,
        ticks: [],
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create bill' });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const bill = await billRepo.findOne({
      where: { id: req.params.id },
      relations: ['creator', 'ticks', 'ticks.user'],
    });

    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    const users = await userRepo.find();
    const tickedUserIds = bill.ticks.map((t) => t.user_id);

    res.json({
      bill: {
        id: bill.id,
        title: bill.title,
        amount: parseFloat(bill.amount as any),
        creator: { id: bill.creator.id, name: bill.creator.name },
        created_at: bill.created_at,
        users: users.map((u) => ({
          id: u.id,
          name: u.name,
          ticked: tickedUserIds.includes(u.id),
          ticked_at: bill.ticks.find((t) => t.user_id === u.id)?.ticked_at,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bill' });
  }
});

router.post('/:id/tick', async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.body;
    const billId = req.params.id;

    const bill = await billRepo.findOne({ where: { id: billId } });
    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    const existingTick = await tickRepo.findOne({
      where: { bill_id: billId, user_id: userId },
    });

    if (existingTick) {
      await tickRepo.remove(existingTick);
      res.json({ ticked: false });
    } else {
      const tick = tickRepo.create({ bill_id: billId, user_id: userId });
      await tickRepo.save(tick);
      res.json({ ticked: true });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle tick' });
  }
});

export default router;
