/**
 * Every charge the maker knows, by name. Names only: the drawings live in charges.ts (our own)
 * and modern.ts (Font Awesome Free), so the model, the blazon writer and the parser can know a
 * charge without carrying its picture. A charge's name and plural are what a blazon calls it,
 * so each must be unique and none may be a word blazon already uses.
 */
export type ChargeKind = 'drawn' | 'modern' | 'egg';

export interface ChargeDef {
  id: string;
  /** As a blazon names one: "mullet", "ear of wheat". */
  name: string;
  /** As a blazon names several: "mullets", "ears of wheat". */
  plural: string;
  kind: ChargeKind;
  /** For the picker. */
  group: string;
  /** Modern charges: the Font Awesome icon it is drawn from (see modern.ts). */
  icon?: string;
}

const drawn = (id: string, name: string, plural = `${name}s`): ChargeDef => ({ id, name, plural, kind: 'drawn', group: 'Heraldic' });
const modern = (group: string, id: string, icon: string, name = id, plural = `${name}s`): ChargeDef => ({ id, name, plural, kind: 'modern', group, icon });

export const charges: readonly ChargeDef[] = [
  drawn('mullet', 'mullet'),
  drawn('crescent', 'crescent'),
  drawn('roundel', 'roundel'),
  drawn('annulet', 'annulet'),
  drawn('fleurDeLis', 'fleur-de-lis', 'fleurs-de-lis'),
  drawn('lion', 'lion'),
  drawn('eagle', 'eagle'),

  modern('Beasts', 'dragon', 'faDragon'),
  modern('Beasts', 'horse', 'faHorse'),
  modern('Beasts', 'cow', 'faCow'),
  modern('Beasts', 'hound', 'faDog'),
  modern('Beasts', 'cat', 'faCat'),
  modern('Beasts', 'hippopotamus', 'faHippo', 'hippopotamus', 'hippopotamuses'),
  modern('Beasts', 'otter', 'faOtter'),
  modern('Beasts', 'frog', 'faFrog'),
  modern('Beasts', 'spider', 'faSpider'),
  modern('Beasts', 'locust', 'faLocust'),
  modern('Beasts', 'worm', 'faWorm'),
  modern('Beasts', 'paw', 'faPaw'),
  modern('Beasts', 'bone', 'faBone'),

  modern('Birds and fish', 'dove', 'faDove'),
  modern('Birds and fish', 'raven', 'faCrow'),
  modern('Birds and fish', 'kiwi', 'faKiwiBird'),
  modern('Birds and fish', 'feather', 'faFeather'),
  modern('Birds and fish', 'egg', 'faEgg'),
  modern('Birds and fish', 'fish', 'faFish', 'fish', 'fish'),
  modern('Birds and fish', 'shrimp', 'faShrimp'),

  modern('Plants', 'tree', 'faTree'),
  modern('Plants', 'leaf', 'faLeaf', 'leaf', 'leaves'),
  modern('Plants', 'seedling', 'faSeedling'),
  modern('Plants', 'clover', 'faClover'),
  modern('Plants', 'lotus', 'faSpa', 'lotus', 'lotuses'),
  modern('Plants', 'wheat', 'faWheatAwn', 'ear of wheat', 'ears of wheat'),
  modern('Plants', 'apple', 'faAppleWhole'),
  modern('Plants', 'lemon', 'faLemon'),
  modern('Plants', 'carrot', 'faCarrot'),
  modern('Plants', 'pepper', 'faPepperHot'),

  modern('Sky and land', 'sun', 'faSun'),
  modern('Sky and land', 'moon', 'faMoon'),
  modern('Sky and land', 'comet', 'faMeteor'),
  modern('Sky and land', 'cloud', 'faCloud'),
  modern('Sky and land', 'thunderbolt', 'faBolt'),
  modern('Sky and land', 'snowflake', 'faSnowflake'),
  modern('Sky and land', 'flame', 'faFire'),
  modern('Sky and land', 'drop', 'faDroplet'),
  modern('Sky and land', 'mountain', 'faMountain'),
  modern('Sky and land', 'volcano', 'faVolcano', 'volcano', 'volcanoes'),
  modern('Sky and land', 'whirlwind', 'faTornado'),

  modern('Crown and state', 'crown', 'faCrown'),
  modern('Crown and state', 'key', 'faKey'),
  modern('Crown and state', 'tower', 'faChessRook'),
  modern('Crown and state', 'escutcheon', 'faShield'),
  modern('Crown and state', 'flag', 'faFlag'),
  modern('Crown and state', 'balance', 'faScaleBalanced'),
  modern('Crown and state', 'scroll', 'faScroll'),
  modern('Crown and state', 'temple', 'faLandmark'),
  modern('Crown and state', 'obelisk', 'faMonument'),
  modern('Crown and state', 'gate', 'faToriiGate'),
  modern('Crown and state', 'knight', 'faChessKnight'),
  modern('Crown and state', 'bishop', 'faChessBishop'),
  modern('Crown and state', 'pawn', 'faChessPawn'),
  modern('Crown and state', 'heart', 'faHeart'),
  modern('Crown and state', 'hand', 'faHand'),
  modern('Crown and state', 'eye', 'faEye'),
  modern('Crown and state', 'gem', 'faGem'),

  modern('Sea and road', 'anchor', 'faAnchor'),
  modern('Sea and road', 'ship', 'faSailboat'),
  modern('Sea and road', 'compass', 'faCompass', 'compass', 'compasses'),
  modern('Sea and road', 'globe', 'faGlobe'),
  modern('Sea and road', 'bridge', 'faBridge'),
  modern('Sea and road', 'wheel', 'faDharmachakra'),
  modern('Sea and road', 'locomotive', 'faTrain'),
  modern('Sea and road', 'aeroplane', 'faPlane'),
  modern('Sea and road', 'rocket', 'faRocket'),

  modern('Work and learning', 'hammer', 'faHammer'),
  modern('Work and learning', 'mallet', 'faGavel'),
  modern('Work and learning', 'spanner', 'faWrench'),
  modern('Work and learning', 'shears', 'faScissors', 'pair of shears', 'pairs of shears'),
  modern('Work and learning', 'cogwheel', 'faGear'),
  modern('Work and learning', 'factory', 'faIndustry', 'factory', 'factories'),
  modern('Work and learning', 'tractor', 'faTractor'),
  modern('Work and learning', 'book', 'faBook'),
  modern('Work and learning', 'openBook', 'faBookOpen', 'open book'),
  modern('Work and learning', 'pen', 'faPenNib'),
  modern('Work and learning', 'lamp', 'faLightbulb'),
  modern('Work and learning', 'hourglass', 'faHourglassHalf', 'hourglass', 'hourglasses'),
  modern('Work and learning', 'flask', 'faFlask'),
  modern('Work and learning', 'microscope', 'faMicroscope'),
  modern('Work and learning', 'atom', 'faAtom'),

  modern('Hearth and table', 'bell', 'faBell'),
  modern('Hearth and table', 'tent', 'faTent'),
  modern('Hearth and table', 'igloo', 'faIgloo'),
  modern('Hearth and table', 'umbrella', 'faUmbrella'),
  modern('Hearth and table', 'cup', 'faTrophy'),
  modern('Hearth and table', 'goblet', 'faWineGlass'),
  modern('Hearth and table', 'tankard', 'faBeerMugEmpty'),
  modern('Hearth and table', 'bottle', 'faWineBottle'),
  modern('Hearth and table', 'loaf', 'faBreadSlice', 'loaf', 'loaves'),
  modern('Hearth and table', 'cheese', 'faCheese', 'cheese', 'cheeses'),
  modern('Hearth and table', 'guitar', 'faGuitar'),
  modern('Hearth and table', 'drum', 'faDrum'),

  modern('Stranger things', 'skull', 'faSkull'),
  modern('Stranger things', 'ghost', 'faGhost'),
  modern('Stranger things', 'bomb', 'faBomb'),
  modern('Stranger things', 'robot', 'faRobot'),
  modern('Stranger things', 'wizardHat', 'faHatWizard', 'wizard hat'),

  // The easter egg: "Or, an emu proper". It parses and draws, but no picker offers it.
  { id: 'emu', name: 'emu', plural: 'emus', kind: 'egg', group: 'Hidden' },
];

const byId = new Map<string, ChargeDef>(charges.map((c) => [c.id, c]));

export const isCharge = (value: unknown): value is string => typeof value === 'string' && byId.has(value);

export function charge(id: string): ChargeDef {
  return byId.get(id) ?? charges[0]!;
}

/** The charges a picker shows: everything but the egg. */
export const pickable: readonly ChargeDef[] = charges.filter((c) => c.kind !== 'egg');

/** The roundel has a name of its own in each plain tincture. */
export const roundelNames: Readonly<Record<string, { name: string; plural: string }>> = {
  or: { name: 'bezant', plural: 'bezants' },
  argent: { name: 'plate', plural: 'plates' },
  gules: { name: 'torteau', plural: 'torteaux' },
  azure: { name: 'hurt', plural: 'hurts' },
  vert: { name: 'pomme', plural: 'pommes' },
  sable: { name: 'pellet', plural: 'pellets' },
  purpure: { name: 'golpe', plural: 'golpes' },
};
