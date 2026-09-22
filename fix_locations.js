const fs = require('fs');
const path = 'src/data/initialData.ts';
let content = fs.readFileSync(path, 'utf8');

const oldLocations = [
  'Agra Office - Ground Floor Reception',
  'Agra Office - 1st Floor Operations Bay',
  'Agra Office - 2nd Floor Server & Tech Room',
  'Agra Office - 1st Floor Conference Room A',
  'Noida HQ - Wing A Executive Suites',
  'Noida HQ - Wing B Engineering Hub',
  'Bengaluru Branch - Koramangala Hub'
];

const newLocation = '410, 4th Floor, Shri Siddhi Vinayak Trade Centre, Agra -282004';

oldLocations.forEach(oldLoc => {
  content = content.split(oldLoc).join(newLocation);
});

fs.writeFileSync(path, content, 'utf8');
console.log('Replaced all old locations.');
