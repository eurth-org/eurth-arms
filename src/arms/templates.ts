/**
 * The templates: arms for nations that don't exist, as starting points and as examples of
 * what the rules allow. Each is a name, a shield shape, a blazon and a line on what the arms
 * say. The blazon is the source: the pictures are drawn from it, and a test reads each one
 * back and expects the very same words, with the rule of tincture respected.
 *
 * Keep them clear of real arms: these are for making new ones.
 */
import type { Shape } from './model';

export interface Template {
  /** For the address: /templates/#hesperwick. */
  id: string;
  nation: string;
  shape: Shape;
  blazon: string;
  /** What the arms say about the nation, in a sentence. */
  meaning: string;
}

export const templates: readonly Template[] = [
  { id: 'hesperwick', nation: 'Hesperwick', shape: 'heater', blazon: 'Vert, a cross argent, a bordure Or', meaning: 'The white cross of its flag on sea green, with a gold border for the evening sun the country is named after.' },
  { id: 'vantmoor', nation: 'Vantmoor', shape: 'heater', blazon: 'Sable, three towers argent', meaning: 'Three watchtowers on the black moor: the old border forts that became its three provinces.' },
  { id: 'calderwyn', nation: 'Calderwyn', shape: 'heater', blazon: 'Azure, a lion rampant Or, a chief ermine', meaning: 'The gold lion of the House of Maravel, under a chief of ermine for the crown.' },
  { id: 'hohenfels', nation: 'Hohenfels', shape: 'french', blazon: 'Gules, on a pile argent a mountain sable', meaning: 'Canting arms: "high rock". A black peak on a white wedge driven into red.' },
  { id: 'ostaril', nation: 'Ostaril', shape: 'spanish', blazon: 'Or, an eagle displayed sable, a bordure gules', meaning: 'The black eagle of the House of Varenko, bordered red since the union of the two crowns.' },
  { id: 'aldermere', nation: 'Aldermere', shape: 'heater', blazon: 'Per fess wavy argent and azure, a tree vert', meaning: 'An alder standing over the lake: the name of the country, drawn.' },
  { id: 'brannoch', nation: 'Brannoch', shape: 'heater', blazon: 'Argent, three ravens sable', meaning: 'Ravens for a name that means "place of ravens", two and one as on its oldest seal.' },
  { id: 'dunmarrow', nation: 'Dunmarrow', shape: 'french', blazon: 'Barry of six Or and vert, a chief gules', meaning: 'Wheat fields and pasture in stripes, under a red chief for the hill fort that guards them.' },
  { id: 'esterholt', nation: 'Esterholt', shape: 'heater', blazon: 'Per pale azure and gules, a sun Or', meaning: 'A rising sun between sea and land: the eastern wood sees the day first.' },
  { id: 'fennmark', nation: 'Fennmark', shape: 'spanish', blazon: 'Vert, a fess wavy argent between three frogs Or', meaning: 'The river through the fens, and the frogs its people are cheerfully named after.' },
  { id: 'garrowmoor', nation: 'Garrowmoor', shape: 'heater', blazon: 'Purpure, a chevron ermine between three crowns Or', meaning: 'Three crowns for the three kingdoms it was made from, on royal purple.' },
  { id: 'halcyra', nation: 'Halcyra', shape: 'polish', blazon: 'Azure, a bend Or between two doves argent', meaning: 'Two doves either side of the golden road: a trading republic that lives by peace.' },
  { id: 'ilvermont', nation: 'Ilvermont', shape: 'heater', blazon: 'Argent, on a chevron gules three mullets of six points Or', meaning: 'A red mountain on snow, with a star for each of the three passes.' },
  { id: 'jasperfell', nation: 'Jasperfell', shape: 'heater', blazon: 'Chequy Or and gules, on a chief sable three bezants', meaning: 'A counting board and gold coins: a country built by its mint and its merchants.' },
  { id: 'kestrelby', nation: 'Kestrelby', shape: 'french', blazon: 'Azure, an eagle rising Or', meaning: 'A bird of prey taking flight, for a town whose name remembers its falconers.' },
  { id: 'lorrimar', nation: 'Lorrimar', shape: 'lozenge', blazon: 'Gules, a saltire Or between four fleurs-de-lis argent', meaning: 'Arms of a line of queens, borne on a lozenge: the crossroads of four lily-growing valleys.' },
  { id: 'marrowdeep', nation: 'Marrowdeep', shape: 'heater', blazon: 'Sable, a pale wavy argent between two anchors Or', meaning: 'The deep channel between two harbours, and the anchors of the fleets that share it.' },
  { id: 'northolme', nation: 'Northolme', shape: 'roundel', blazon: 'Azure, a mullet of eight points argent, a bordure engrailed argent', meaning: 'The pole star inside a ring of ice, shown round as on the great seal.' },
  { id: 'orrenvale', nation: 'Orrenvale', shape: 'heater', blazon: 'Quarterly gules and Or, a lion passant guardant sable', meaning: 'Two houses quartered after a marriage, with one watchful lion walking across both.' },
  { id: 'pellinmark', nation: 'Pellinmark', shape: 'polish', blazon: 'Argent, a fess embattled gules between three pellets', meaning: 'A red town wall and three cannonballs: a fortress that was never taken.' },
  { id: 'quillhaven', nation: 'Quillhaven', shape: 'french', blazon: 'Azure, a pen argent, on a chief Or three open books gules', meaning: 'A university town that became a state: one pen, three faculties.' },
  { id: 'rosmarch', nation: 'Rosmarch', shape: 'spanish', blazon: 'Paly of six argent and gules, a horse sable', meaning: 'The striped tents of the horse fairs, and the black horse they are held for.' },
  { id: 'ulvenheim', nation: 'Ulvenheim', shape: 'heater', blazon: 'Gules, a lion couchant Or', meaning: 'A lion at rest but awake: a neutral country that keeps its army.' },
  { id: 'wexmoor', nation: 'Wexmoor', shape: 'heater', blazon: 'Ermine, a lion sejant erect gules', meaning: 'A red lion sitting in judgment on ermine: the arms of the high court that founded the state.' },
];
