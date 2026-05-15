import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const flights = [
  { flightNumber: 'CA1301', airline: '中国国航', departureCity: '北京', arrivalCity: '上海', departureTime: new Date('2026-06-01T08:00:00'), arrivalTime: new Date('2026-06-01T10:15:00'), status: 'scheduled' },
  { flightNumber: 'MU5101', airline: '东方航空', departureCity: '上海', arrivalCity: '广州', departureTime: new Date('2026-06-01T09:30:00'), arrivalTime: new Date('2026-06-01T12:00:00'), status: 'scheduled' },
  { flightNumber: 'CZ3101', airline: '南方航空', departureCity: '广州', arrivalCity: '北京', departureTime: new Date('2026-06-01T07:00:00'), arrivalTime: new Date('2026-06-01T10:00:00'), status: 'delayed' },
  { flightNumber: 'HU7601', airline: '海南航空', departureCity: '北京', arrivalCity: '深圳', departureTime: new Date('2026-06-01T11:00:00'), arrivalTime: new Date('2026-06-01T14:00:00'), status: 'scheduled' },
  { flightNumber: 'CA1501', airline: '中国国航', departureCity: '北京', arrivalCity: '成都', departureTime: new Date('2026-06-01T06:30:00'), arrivalTime: new Date('2026-06-01T09:30:00'), status: 'landed' },
  { flightNumber: 'MU2301', airline: '东方航空', departureCity: '上海', arrivalCity: '杭州', departureTime: new Date('2026-06-01T14:00:00'), arrivalTime: new Date('2026-06-01T15:00:00'), status: 'scheduled' },
  { flightNumber: 'CZ6901', airline: '南方航空', departureCity: '深圳', arrivalCity: '上海', departureTime: new Date('2026-06-01T16:00:00'), arrivalTime: new Date('2026-06-01T18:30:00'), status: 'cancelled' },
  { flightNumber: 'CA1801', airline: '中国国航', departureCity: '成都', arrivalCity: '上海', departureTime: new Date('2026-06-01T10:00:00'), arrivalTime: new Date('2026-06-01T12:30:00'), status: 'scheduled' },
  { flightNumber: 'HU7801', airline: '海南航空', departureCity: '深圳', arrivalCity: '北京', departureTime: new Date('2026-06-01T08:30:00'), arrivalTime: new Date('2026-06-01T11:30:00'), status: 'delayed' },
  { flightNumber: 'MU9201', airline: '东方航空', departureCity: '杭州', arrivalCity: '北京', departureTime: new Date('2026-06-01T13:00:00'), arrivalTime: new Date('2026-06-01T15:30:00'), status: 'landed' },
  { flightNumber: 'CA1601', airline: '中国国航', departureCity: '上海', arrivalCity: '深圳', departureTime: new Date('2026-06-01T07:30:00'), arrivalTime: new Date('2026-06-01T10:00:00'), status: 'scheduled' },
  { flightNumber: 'CZ3301', airline: '南方航空', departureCity: '广州', arrivalCity: '成都', departureTime: new Date('2026-06-01T12:00:00'), arrivalTime: new Date('2026-06-01T14:30:00'), status: 'scheduled' },
  { flightNumber: 'HU7201', airline: '海南航空', departureCity: '成都', arrivalCity: '广州', departureTime: new Date('2026-06-01T15:00:00'), arrivalTime: new Date('2026-06-01T17:30:00'), status: 'delayed' },
  { flightNumber: 'MU5301', airline: '东方航空', departureCity: '上海', arrivalCity: '北京', departureTime: new Date('2026-06-01T18:00:00'), arrivalTime: new Date('2026-06-01T20:15:00'), status: 'scheduled' },
  { flightNumber: 'CA1901', airline: '中国国航', departureCity: '北京', arrivalCity: '杭州', departureTime: new Date('2026-06-01T20:00:00'), arrivalTime: new Date('2026-06-01T22:15:00'), status: 'scheduled' },
  { flightNumber: 'CZ3501', airline: '南方航空', departureCity: '深圳', arrivalCity: '成都', departureTime: new Date('2026-06-01T09:00:00'), arrivalTime: new Date('2026-06-01T11:30:00'), status: 'landed' },
  { flightNumber: 'HU7401', airline: '海南航空', departureCity: '杭州', arrivalCity: '深圳', departureTime: new Date('2026-06-01T17:00:00'), arrivalTime: new Date('2026-06-01T19:30:00'), status: 'cancelled' },
  { flightNumber: 'MU7101', airline: '东方航空', departureCity: '广州', arrivalCity: '上海', departureTime: new Date('2026-06-01T10:30:00'), arrivalTime: new Date('2026-06-01T13:00:00'), status: 'scheduled' },
  { flightNumber: 'CA2101', airline: '中国国航', departureCity: '成都', arrivalCity: '北京', departureTime: new Date('2026-06-01T21:00:00'), arrivalTime: new Date('2026-06-01T23:30:00'), status: 'scheduled' },
  { flightNumber: 'CZ3701', airline: '南方航空', departureCity: '北京', arrivalCity: '广州', departureTime: new Date('2026-06-01T22:00:00'), arrivalTime: new Date('2026-06-02T01:00:00'), status: 'scheduled' },
];

async function main() {
  await prisma.flight.deleteMany();
  for (const flight of flights) {
    await prisma.flight.create({ data: flight });
  }
  console.log(`Seeded ${flights.length} flights`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
