import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { User } from '../models/User.js'
import { Driver } from '../models/Driver.js'
import { Car } from '../models/Car.js'
import { Race } from '../models/Race.js'

dotenv.config()

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://race-game-user:YYdSRPhMQWHRA6O6@game.ocbvnmi.mongodb.net/?retryWrites=true&w=majority&appName=game'
    await mongoose.connect(mongoUri)
    console.log('✅ Connected to MongoDB for seeding')

    // Clear existing data
    await User.deleteMany({})
    await Driver.deleteMany({})
    await Car.deleteMany({})
    await Race.deleteMany({})
    console.log('🗑️  Cleared existing data')

    // Create additional real users
    const demoUsers = [
      {
        username: 'SpeedDemon',
        email: 'speed@demo.com',
        password: 'password123',
        tokens: 50,
        points: 150
      },
      {
        username: 'TrackMaster',
        email: 'track@demo.com',
        password: 'password123',
        tokens: 30,
        points: 120
      },
      {
        username: 'RacingPro',
        email: 'racing@demo.com',
        password: 'password123',
        tokens: 40,
        points: 200
      },
      {
        username: 'NeonRacer',
        email: 'neon@demo.com',
        password: 'password123',
        tokens: 25,
        points: 80
      },
      {
        username: 'TurboBoost',
        email: 'turbo@demo.com',
        password: 'password123',
        tokens: 35,
        points: 95
      },
      // 5 more distinct users
      {
        username: 'ApexHunter',
        email: 'apex@demo.com',
        password: 'password123',
        tokens: 45,
        points: 110
      },
      {
        username: 'Slipstream',
        email: 'slip@demo.com',
        password: 'password123',
        tokens: 28,
        points: 135
      },
      {
        username: 'PitWizard',
        email: 'pit@demo.com',
        password: 'password123',
        tokens: 32,
        points: 75
      },
      {
        username: 'DraftKing',
        email: 'draft@demo.com',
        password: 'password123',
        tokens: 60,
        points: 210
      },
      {
        username: 'ChicanePro',
        email: 'chicane@demo.com',
        password: 'password123',
        tokens: 22,
        points: 65
      }
    ]

    const users = []
    const drivers = []
    const cars = []

    // Prepare unique image assignments (1..12), shuffled for variety
    const picPool = Array.from({ length: 12 }, (_, i) => i + 1)
    const shuffle = (arr: number[]) => [...arr].sort(() => Math.random() - 0.5)
    const shuffledProfilePics = shuffle(picPool)
    const shuffledCarPics = shuffle(picPool)

    for (const [idx, userData] of demoUsers.entries()) {
      // Create user first
      const user = new User({
        ...userData,
        driverId: '', // Will be updated after driver creation
        carId: '', // Will be updated after car creation
        // Use a unique image index for each user (first 10 out of 12 available)
        profilePic: shuffledProfilePics[idx] ?? shuffledProfilePics[idx % shuffledProfilePics.length],
        carPic: shuffledCarPics[idx] ?? shuffledCarPics[idx % shuffledCarPics.length],
        facility: {
          trainingLevel: 1 + Math.floor(Math.random() * 3),
          warehouseLevel: 1 + Math.floor(Math.random() * 2)
        }
      })
      await user.save()
      users.push(user)

      // Create driver with user ID
      const driver = new Driver({
        userId: user._id.toString(),
        name: `${userData.username} Racer`,
        stats: {
          cornering: 45 + Math.floor(Math.random() * 20),
          overtaking: 50 + Math.floor(Math.random() * 15),
          defending: 40 + Math.floor(Math.random() * 25),
          aggression: 55 + Math.floor(Math.random() * 20),
          composure: 45 + Math.floor(Math.random() * 20)
        },
        statPointsAvailable: Math.floor(Math.random() * 10)
      })
      await driver.save()
      drivers.push(driver)

      // Create car with user ID
      const car = new Car({
        userId: user._id.toString(),
        name: `${userData.username}'s Speedster`,
        stats: {
          speed: 50 + Math.floor(Math.random() * 20),
          acceleration: 45 + Math.floor(Math.random() * 25),
          braking: 50 + Math.floor(Math.random() * 20),
          aero: 40 + Math.floor(Math.random() * 30),
          fuel: 45 + Math.floor(Math.random() * 25),
          tireWear: 50 + Math.floor(Math.random() * 20),
          grip: 55 + Math.floor(Math.random() * 15),
          durability: 50 + Math.floor(Math.random() * 20)
        },
        statPointsAvailable: Math.floor(Math.random() * 8),
        condition: 70 + Math.floor(Math.random() * 30)
      })
      await car.save()
      cars.push(car)

      // Update user with driver and car IDs
      user.driverId = driver._id.toString()
      user.carId = car._id.toString()
      await user.save()
    }

    console.log(`👥 Created ${users.length} users with drivers and cars`)

    // Create demo races
    const raceTracks = [
      'Neon City Circuit',
      'Cyber Speedway',
      'Pixel Park Track',
      'Retro Raceway',
      'Digital Drag Strip',
      'Virtual Valley',
      'Matrix Motorsport',
      'Glitch Grand Prix'
    ]

    const races = []
    const now = new Date()

    for (let i = 0; i < 8; i++) {
      const startTime = new Date(now.getTime() + (i * 2 + 1) * 60 * 60 * 1000) // Every 2 hours starting from 1 hour from now
      const participants = users.slice(0, 3 + Math.floor(Math.random() * 3)).map(u => u._id.toString())
      
      const race = new Race({
        name: `Race ${i + 1}`,
        track: raceTracks[i],
        startTime,
        participants,
        status: i < 2 ? 'completed' : 'scheduled'
      })

      // Add results for completed races
      if (i < 2) {
        const shuffledParticipants = [...participants].sort(() => Math.random() - 0.5)
        race.results = shuffledParticipants.map((userId, index) => ({
          userId,
          position: index + 1,
          points: index === 0 ? 25 : index === 1 ? 18 : index === 2 ? 15 : 12 - index,
          time: 60000 + (index * 5000) + Math.floor(Math.random() * 3000),
          fastestLap: index === 0
        }))
      }

      await race.save()
      races.push(race)
    }

    console.log(`🏁 Created ${races.length} races`)

    console.log('✅ Database seeded successfully!')
    console.log('\n📊 Demo Data Summary:')
    console.log(`- Users: ${users.length}`)
    console.log(`- Drivers: ${drivers.length}`)
    console.log(`- Cars: ${cars.length}`)
    console.log(`- Races: ${races.length}`)
    console.log('\n🔑 Demo Login Credentials:')
    demoUsers.forEach(user => {
      console.log(`- Username: ${user.username}, Password: password123`)
    })

  } catch (error) {
    console.error('❌ Seeding failed:', error)
  } finally {
    await mongoose.connection.close()
    console.log('🔌 Database connection closed')
    process.exit(0)
  }
}

seedData()
