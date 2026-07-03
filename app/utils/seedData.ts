export const DEFAULT_LAYERS = [
  { key: 'bodyWash', label: 'Body Wash', shortLabel: 'Wash' },
  { key: 'bodyLotion', label: 'Body Lotion', shortLabel: 'Lotion' },
  { key: 'bodyOil', label: 'Body Oil', shortLabel: 'Oil' },
  { key: 'perfumeOil', label: 'Perfume Oil', shortLabel: 'Perfume Oil' },
  { key: 'bodyMist', label: 'Body Mist', shortLabel: 'Mist' },
  { key: 'perfumesToppers', label: 'Perfumes and Toppers', shortLabel: 'Perfume/Topper' },
];

export const DEFAULT_SCENTS = [
  { name: 'Raspberry Sorbet', layers: ['bodyWash', 'bodyLotion', 'bodyMist'] },
  { name: 'Seaside Citrus', layers: ['bodyWash', 'bodyLotion', 'bodyMist'] },
  { name: 'Coconut Cream', layers: ['bodyWash', 'bodyLotion', 'bodyOil'] },
  { name: 'Sugared Lemon', layers: ['bodyWash'] },
  { name: 'Black Cherry', layers: ['bodyWash', 'perfumeOil'] },
  { name: 'Toasted Marshmallow', layers: ['bodyWash', 'perfumesToppers'] },
  { name: 'Sweet Pea', layers: ['bodyWash', 'bodyMist'] },
  { name: 'Cucumber Mint', layers: ['bodyWash'] },
  { name: 'Pink Grapefruit', layers: ['bodyWash', 'bodyMist'] },
  { name: 'Vanilla Bean', layers: ['bodyLotion', 'bodyOil', 'perfumeOil', 'perfumesToppers'] },
  { name: 'Cashmere Musk', layers: ['bodyLotion', 'bodyOil', 'perfumeOil', 'perfumesToppers'] },
  { name: 'Sun-Ripened Peach', layers: ['bodyLotion', 'bodyOil', 'bodyMist'] },
  { name: 'Salted Caramel', layers: ['bodyLotion', 'perfumesToppers'] },
  { name: 'White Gardenia', layers: ['bodyLotion', 'bodyOil', 'perfumesToppers'] },
  { name: 'Brown Sugar Fig', layers: ['bodyLotion', 'perfumeOil', 'perfumesToppers'] },
  { name: 'Golden Amber', layers: ['bodyOil', 'perfumeOil', 'perfumesToppers'] },
  { name: 'Warm Praline', layers: ['bodyOil', 'perfumeOil', 'perfumesToppers'] },
  { name: 'Rose Petal', layers: ['perfumeOil', 'perfumesToppers'] },
  { name: 'Champagne Fizz', layers: ['bodyMist', 'perfumesToppers'] },
  { name: 'Mango Passion', layers: ['bodyMist', 'perfumesToppers'] },
  { name: 'Iced Berry', layers: ['bodyMist'] },
  { name: 'Fresh Linen', layers: ['bodyMist'] },
  { name: 'Wild Honey', layers: ['perfumesToppers'] },
];

export const DEFAULT_VIBES = [
  {
    name: 'Bakery/Comfort', color: 'var(--fam-gourmand)', title: 'The Bakery Vibe (The "Comfort" Anchor)',
    logic: 'This is the heaviest, most "grounded" category. It uses gourmand notes (vanilla, caramel, praline, dough, spice) to evoke a physical place—a warm kitchen or a bakery. These scents are "dense" because they lack crisp or airy notes.',
    weight: 'Heavy, enveloping, warm.', secretWord: 'Persistence',
    secretText: 'These scents are designed to cling to clothes and skin for hours.',
    bestFor: 'High-stress days, cozy nights in, or whenever you need an emotional "hug" from your scent.',
  },
  {
    name: 'Creamy/Skin-Silk', color: 'var(--fam-woody)', title: 'The Creamy Vibe (The "Skin-Silk" Layer)',
    logic: 'This is the most "subtle" category. It uses musk, sandalwood, and "lactonic" (milky/whipped cream) notes. It isn’t trying to smell like food, but rather like the idea of softness.',
    weight: 'Weightless, smooth, diffused.', secretWord: 'Proximity',
    secretText: 'These scents don’t shout; they whisper. They stay close to your body, making you smell "naturally" delicious.',
    bestFor: 'Intimate settings, office environments, or when you want to feel put-together without being "loud."',
  },
  {
    name: 'Crisp/Clean/Reset Button', color: 'var(--fam-aromatic)', title: 'The Crisp/Clean Vibe (The "Reset" Button)',
    logic: 'This is the most "structured" category. It relies on soap-like aldehydes, clean musk, and herbal notes. It aims for a "functional" smell—you want to smell like you just stepped out of a high-end spa, not like you’re wearing a bottle of perfume.',
    weight: 'Sharp, airy, vertical (it goes "up" instead of "out").', secretWord: 'Clarity',
    secretText: 'It removes the "fuzziness" of gourmands.',
    bestFor: 'Gym, running errands, or early morning meetings when you need to feel alert.',
  },
  {
    name: 'Effervescent/Active', color: 'var(--fam-citrus)', title: 'The Effervescent Vibe (The "Energy Spark")',
    logic: 'This is the most "vibrant" category. It uses ginger, mint, citrus, and crisp, sparkling aldehydes to create a sense of movement and "fizz." It isn’t trying to smell like food or a forest; it is designed to smell like a refreshing, high-energy tonic.',
    weight: 'Lightweight, bubbly, energetic.', secretWord: 'Radiance',
    secretText: 'Unlike heavy gourmands that "sit" on the skin, effervescent scents "bounce" off the skin. They create an invisible halo of freshness that makes you feel instantly more alert.',
    bestFor: 'High-energy errand days, shopping, summer brunch, or any time you need to "wake up" your mood and feel sharp and organized.',
  },
  {
    name: 'Fruit Orchard/Natural', color: 'var(--fam-green)', title: 'The Fruit Orchard Vibe (The "Natural" Vitality)',
    logic: 'This is "Real-Life" fruit. It’s not "candy" (which is artificial/sweet); it’s "juicy" (which is watery/natural). It uses stone fruits (peach, pear, apple, cherry) to add a dose of "bounced light" to your skin.',
    weight: 'Juicy, rounded, glowing.', secretWord: 'Juiciness',
    secretText: 'It needs to smell like the fruit was just cut.',
    bestFor: 'Day dates, brunch, or outdoor shopping where you want to appear approachable and energetic.',
  },
  {
    name: 'Spicy/Sophisticated', color: 'var(--fam-amber)', title: 'The Sophisticated/Spicy Vibe (The "Power" Play)',
    logic: 'This is the most complex category. It uses resinous amber, deep woods, and sharp spices (ginger, pepper) to create a scent that is "mysterious." It doesn’t tell a simple story; it’s an adult fragrance.',
    weight: 'Dense, slow-moving, long-lasting.', secretWord: 'Complexity',
    secretText: 'These perfumes have many layers, so they change smell throughout the day.',
    bestFor: 'Evening events, date nights, or leadership roles where you want to command the room.',
  },
  {
    name: 'Tropical/Escape', color: 'var(--fam-floral)', title: 'The Tropical Vibe (The "Escape" Mechanism)',
    logic: 'This is the only category that "transports" the wearer. It uses sun-warmed ingredients like coconut, mango, guava, and honeysuckle. It’s designed to counteract the feeling of being "stuck" in a routine.',
    weight: 'Sun-drenched, radiant, expansive.', secretWord: 'Projection',
    secretText: 'Tropical scents tend to project further because they are meant to mimic the smell of skin after a day in the sun and salt.',
    bestFor: 'Vacation, pool days, or those long Arizona afternoons when you wish you were on a beach.',
  },
];

export const DEFAULT_WISH_CATEGORIES = [
  'Travel Size', 'Full Size', 'Body Wash', 'Body Lotion', 'Body Mist', 'Body Oil', 'Perfume Oil',
];
