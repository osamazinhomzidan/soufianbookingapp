const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')
  
  // Create sample hotel
  const hotel = await prisma.hotel.create({
    data: {
      name: 'Grand Hotel',
      description: 'A luxurious hotel in the heart of the city',
      location: 'Downtown',
    },
  })

  // Create sample rooms
  await prisma.room.createMany({
    data: [
      {
        number: '101',
        type: 'Standard',
        price: 100.0,
        hotelId: hotel.id,
      },
      {
        number: '102',
        type: 'Deluxe',
        price: 150.0,
        hotelId: hotel.id,
      },
      {
        number: '201',
        type: 'Suite',
        price: 250.0,
        hotelId: hotel.id,
      },
    ],
  })

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })