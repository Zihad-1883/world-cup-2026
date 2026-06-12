import { query } from './config/db';

async function seed() {
  const players = [
    // Mexico
    { teamId: 'f8311724-db8d-47eb-a7b8-6c50790d58d3', name: 'Guillermo Ochoa', shirtName: 'OCHOA', position: 'GK', jerseyNumber: 13, club: 'Salernitana' },
    { teamId: 'f8311724-db8d-47eb-a7b8-6c50790d58d3', name: 'Edson Álvarez', shirtName: 'ÁLVAREZ', position: 'MF', jerseyNumber: 4, club: 'West Ham' },
    { teamId: 'f8311724-db8d-47eb-a7b8-6c50790d58d3', name: 'Santiago Giménez', shirtName: 'GIMÉNEZ', position: 'FW', jerseyNumber: 11, club: 'Feyenoord' },
    { teamId: 'f8311724-db8d-47eb-a7b8-6c50790d58d3', name: 'Hirving Lozano', shirtName: 'LOZANO', position: 'FW', jerseyNumber: 22, club: 'PSV' },
    { teamId: 'f8311724-db8d-47eb-a7b8-6c50790d58d3', name: 'César Montes', shirtName: 'MONTES', position: 'DF', jerseyNumber: 3, club: 'Almería' },

    // South Africa
    { teamId: '069ed078-4fbc-4b0c-86d2-6e790d388079', name: 'Ronwen Williams', shirtName: 'WILLIAMS', position: 'GK', jerseyNumber: 1, club: 'Mamelodi Sundowns' },
    { teamId: '069ed078-4fbc-4b0c-86d2-6e790d388079', name: 'Percy Tau', shirtName: 'TAU', position: 'FW', jerseyNumber: 10, club: 'Al Ahly' },
    { teamId: '069ed078-4fbc-4b0c-86d2-6e790d388079', name: 'Teboho Mokoena', shirtName: 'MOKOENA', position: 'MF', jerseyNumber: 4, club: 'Mamelodi Sundowns' },
    { teamId: '069ed078-4fbc-4b0c-86d2-6e790d388079', name: 'Themba Zwane', shirtName: 'ZWANE', position: 'MF', jerseyNumber: 18, club: 'Mamelodi Sundowns' },
    { teamId: '069ed078-4fbc-4b0c-86d2-6e790d388079', name: 'Khuliso Mudau', shirtName: 'MUDAU', position: 'DF', jerseyNumber: 20, club: 'Mamelodi Sundowns' },
  ];

  for (const p of players) {
    await query(
      'INSERT INTO players (team_id, name, shirt_name, position, jersey_number, club) VALUES ($1, $2, $3, $4, $5, $6)',
      [p.teamId, p.name, p.shirtName, p.position, p.jerseyNumber, p.club]
    );
  }
  console.log('Players seeded successfully');
  process.exit(0);
}

seed();
