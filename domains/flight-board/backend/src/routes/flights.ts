import { Router, Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (req: Request, res: Response) => {
  try {
    const { departureCity, arrivalCity, airline, status } = req.query;

    const where: Prisma.FlightWhereInput = {};
    if (typeof departureCity === 'string' && departureCity) where.departureCity = departureCity;
    if (typeof arrivalCity === 'string' && arrivalCity) where.arrivalCity = arrivalCity;
    if (typeof airline === 'string' && airline) where.airline = airline;
    if (typeof status === 'string' && status) where.status = status;

    const flights = await prisma.flight.findMany({
      where,
      orderBy: { departureTime: 'asc' },
    });

    res.json({ success: true, data: flights });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch flights' });
  }
});

router.get('/filters', async (_req: Request, res: Response) => {
  try {
    const [departureCities, arrivalCities, airlines, statuses] = await Promise.all([
      prisma.flight.findMany({ select: { departureCity: true }, distinct: ['departureCity'], orderBy: { departureCity: 'asc' } }),
      prisma.flight.findMany({ select: { arrivalCity: true }, distinct: ['arrivalCity'], orderBy: { arrivalCity: 'asc' } }),
      prisma.flight.findMany({ select: { airline: true }, distinct: ['airline'], orderBy: { airline: 'asc' } }),
      prisma.flight.findMany({ select: { status: true }, distinct: ['status'], orderBy: { status: 'asc' } }),
    ]);

    res.json({
      success: true,
      data: {
        departureCities: departureCities.map(r => r.departureCity),
        arrivalCities: arrivalCities.map(r => r.arrivalCity),
        airlines: airlines.map(r => r.airline),
        statuses: statuses.map(r => r.status),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch filters' });
  }
});

export default router;
