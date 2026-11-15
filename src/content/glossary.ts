/**
 * The glossary: every term the maker and the guide use. Each entry's id is its anchor on the
 * glossary page (/glossary/#fess); a figure is a blazon the engine draws beside the definition.
 * Entries are written here in whatever order is easiest to keep, and sorted by term below.
 */
import type { Shape } from '../arms/model';

export interface GlossaryEntry {
  /** The anchor: lower case, hyphens. */
  id: string;
  term: string;
  /** Plain text, one to three sentences. */
  definition: string;
  /** A blazon to draw, exactly as the maker writes it. */
  figure?: string;
  /** The shield to draw the figure on, where the shield is the point. */
  shape?: Shape;
  /** Related entries, by id. */
  see?: string[];
}

const entries: GlossaryEntry[] = [
  // The language
  { id: 'blazon', term: 'Blazon', definition: 'A coat of arms described in words, in a set order and a vocabulary of its own. The blazon is the arms: any picture that follows it is a correct picture of them.', see: ['coat-of-arms', 'tincture'] },
  { id: 'coat-of-arms', term: 'Coat of arms', definition: 'The design on a shield that identifies a person, a family, a town or a state. Strictly it means the shield alone; loosely, everything displayed with it.', see: ['achievement', 'shield'] },
  { id: 'achievement', term: 'Achievement', definition: 'The full display of arms: the shield with everything around it, such as the helm, crest, mantling, supporters and motto. The maker draws the shield, the one part every achievement must have.', see: ['crest', 'helm', 'mantling', 'supporters', 'motto'] },
  { id: 'armiger', term: 'Armiger', definition: 'A person or body entitled to bear a coat of arms.' },
  { id: 'herald', term: 'Herald', definition: 'An officer who records, grants and rules on arms. Heralds began as the announcers at tournaments, who had to know every shield on the field.' },
  { id: 'shield', term: 'Shield', definition: 'The surface the arms are painted on, also called the escutcheon. Its outline is the artist’s choice and no part of the blazon, so the same arms may be shown on any shape.', see: ['heater-shield', 'lozenge', 'roundel'] },
  { id: 'field', term: 'Field', definition: 'The background of the shield, and the first thing a blazon names. It may be one tincture, divided into parts, or covered in a pattern.', figure: 'Azure', see: ['division', 'tincture'] },
  { id: 'dexter', term: 'Dexter', definition: 'The right-hand side of the shield from the point of view of the person holding it, so the left as you look at it. It is the side of greater honour, and the side beasts face.', see: ['sinister'] },
  { id: 'sinister', term: 'Sinister', definition: 'The left-hand side of the shield from the bearer’s point of view, so the right as you look at it. The word is plain Latin for left and carries no bad meaning in heraldry.', see: ['dexter'] },
  { id: 'base', term: 'Base', definition: 'The lower part of the shield, opposite the chief.', see: ['chief'] },

  // Tinctures
  { id: 'tincture', term: 'Tincture', definition: 'Any of the paints of heraldry: the two metals, the five colours and the furs.', see: ['metal', 'colour', 'fur', 'rule-of-tincture'] },
  { id: 'metal', term: 'Metal', definition: 'Gold or silver, called Or and argent and painted yellow and white. The metals are the light tinctures.', see: ['or', 'argent', 'colour'] },
  { id: 'colour', term: 'Colour', definition: 'One of the five dark tinctures: gules (red), azure (blue), vert (green), sable (black) and purpure (purple).', see: ['metal', 'rule-of-tincture'] },
  { id: 'fur', term: 'Fur', definition: 'A tincture that is a pattern, taken from the furs that lined medieval cloaks. Ermine and vair are the two chief ones. A fur may lie on a metal or a colour, and either may lie on it.', see: ['ermine', 'vair'] },
  { id: 'or', term: 'Or', definition: 'Gold, one of the two metals, painted yellow. It is always written with a capital so that it cannot be read as the word or.', figure: 'Or', see: ['metal'] },
  { id: 'argent', term: 'Argent', definition: 'Silver, one of the two metals, painted white.', figure: 'Argent', see: ['metal'] },
  { id: 'gules', term: 'Gules', definition: 'Red, the commonest colour in heraldry.', figure: 'Gules', see: ['colour'] },
  { id: 'azure', term: 'Azure', definition: 'Blue. The word comes, by way of Arabic and Persian, from the blue stone lapis lazuli.', figure: 'Azure', see: ['colour'] },
  { id: 'vert', term: 'Vert', definition: 'Green, from the French word for it.', figure: 'Vert', see: ['colour'] },
  { id: 'sable', term: 'Sable', definition: 'Black, named after the dark fur of the sable.', figure: 'Sable', see: ['colour'] },
  { id: 'purpure', term: 'Purpure', definition: 'Purple, the rarest of the five colours.', figure: 'Purpure', see: ['colour'] },
  { id: 'ermine', term: 'Ermine', definition: 'A fur: white, strewn with small black spots that stand for the tails of the stoat in its winter coat. The fur of royal and judges’ robes.', figure: 'Ermine', see: ['fur'] },
  { id: 'vair', term: 'Vair', definition: 'A fur: rows of blue and white bell shapes, standing for the backs and bellies of squirrel skins sewn together.', figure: 'Vair', see: ['fur'] },
  { id: 'proper', term: 'Proper', definition: 'In its natural colours. A charge blazoned proper is painted as the thing looks in life, and stands outside the rule of tincture.', see: ['rule-of-tincture'] },
  { id: 'stain', term: 'Stain', definition: 'One of three later, rarer colours: tenné (orange-brown), sanguine (blood red) and murrey (mulberry). The maker leaves them out.', see: ['colour'] },
  { id: 'rule-of-tincture', term: 'Rule of tincture', definition: 'Never put a colour on a colour or a metal on a metal. It keeps arms readable at a distance, because the metals are light and the colours dark. Furs, charges proper and fields parted of a metal and a colour are outside it.', figure: 'Azure, a chevron Or between three mullets argent', see: ['metal', 'colour', 'armes-a-enquerir'] },
  { id: 'armes-a-enquerir', term: 'Armes à enquérir', definition: 'Arms to ask about: arms that break the rule of tincture on purpose, so that people will ask why. The gold crosses on silver of the Kingdom of Jerusalem are the famous case.', figure: 'Argent, a cross Or', see: ['rule-of-tincture'] },
  { id: 'hatching', term: 'Hatching', definition: 'A way of showing tinctures in black and white, with dots for Or, upright lines for gules, level lines for azure and so on. Engravers have used it since the seventeenth century.', see: ['tincture'] },

  // The shield's shapes
  { id: 'heater-shield', term: 'Heater shield', definition: 'The classic shield of heraldry: flat across the top, straight at the sides and curving to a point. It is named after the base of a clothes iron.', figure: 'Azure, a chevron Or between three mullets argent', shape: 'heater', see: ['shield'] },
  { id: 'french-shield', term: 'French shield', definition: 'A nearly square shield with rounded lower corners and a small point at the foot. It leaves the most room for the design.', figure: 'Azure, three fleurs-de-lis Or', shape: 'french', see: ['shield'] },
  { id: 'spanish-shield', term: 'Spanish shield', definition: 'A shield that is square at the top and a half circle at the foot, common in Spain and Portugal.', figure: 'Gules, a tower Or', shape: 'spanish', see: ['shield'] },
  { id: 'polish-shield', term: 'Polish shield', definition: 'A baroque shield with pointed upper corners, a scalloped top and curved sides, as seen on Polish and other central European arms.', figure: 'Gules, an eagle displayed argent', shape: 'polish', see: ['shield'] },
  { id: 'lozenge', term: 'Lozenge', definition: 'A diamond shape. As a shield it is the traditional way of showing the arms of a woman, who by custom did not carry a shield to war.', figure: 'Gules, a saltire Or between four fleurs-de-lis argent', shape: 'lozenge', see: ['shield'] },
  { id: 'roundel', term: 'Roundel', definition: 'A flat disc. As a charge it has a name of its own in each tincture, from the gold bezant to the purple golpe. As a shield it shows arms as a seal or a badge does.', figure: 'Sable, three roundels ermine', see: ['bezant', 'plate', 'torteau', 'hurt', 'pomme', 'pellet', 'golpe'] },

  // Divisions and patterns
  { id: 'division', term: 'Division', definition: 'A way of parting the field into areas of different tinctures, named after the ordinary whose line it follows: per pale, per fess and so on.', see: ['field', 'line-of-partition'] },
  { id: 'per-pale', term: 'Per pale', definition: 'Divided down the middle into a dexter and a sinister half.', figure: 'Per pale gules and azure', see: ['pale', 'in-pale'] },
  { id: 'per-fess', term: 'Per fess', definition: 'Divided across the middle into an upper and a lower half.', figure: 'Per fess azure and argent', see: ['fess'] },
  { id: 'per-bend', term: 'Per bend', definition: 'Divided diagonally, from the top on the dexter side to the bottom on the sinister.', figure: 'Per bend Or and vert', see: ['bend'] },
  { id: 'per-bend-sinister', term: 'Per bend sinister', definition: 'Divided diagonally the other way, from the top on the sinister side to the bottom on the dexter.', figure: 'Per bend sinister argent and sable', see: ['per-bend'] },
  { id: 'per-chevron', term: 'Per chevron', definition: 'Divided by a line that rises to a point in the middle, like a roof.', figure: 'Per chevron sable and Or', see: ['chevron'] },
  { id: 'per-saltire', term: 'Per saltire', definition: 'Divided into four by both diagonals, with one tincture at the top and bottom and the other at the sides.', figure: 'Per saltire gules and argent', see: ['saltire'] },
  { id: 'quarterly', term: 'Quarterly', definition: 'Divided into four quarters by an upright and a level line. The first tincture takes the first and fourth quarters, the second takes the other two.', figure: 'Quarterly gules and Or', see: ['quartering'] },
  { id: 'tierced', term: 'Tierced', definition: 'Divided into three parts, each of its own tincture: per pale in three upright bands, per fess in three level ones, or per pall along the lines of a letter Y.', figure: 'Tierced per pale vert, argent and gules', see: ['division'] },
  { id: 'barry', term: 'Barry', definition: 'Covered in an even number of level stripes of two tinctures by turns. The blazon gives the number: barry of six.', figure: 'Barry of six argent and azure', see: ['paly', 'bendy'] },
  { id: 'paly', term: 'Paly', definition: 'Covered in an even number of upright stripes of two tinctures by turns.', figure: 'Paly of six argent and gules', see: ['barry', 'pale'] },
  { id: 'bendy', term: 'Bendy', definition: 'Covered in an even number of diagonal stripes of two tinctures by turns, running the way a bend runs.', figure: 'Bendy of six Or and azure', see: ['barry', 'bend'] },
  { id: 'chequy', term: 'Chequy', definition: 'Covered in squares of two tinctures by turns, like a chessboard. Also spelt checky.', figure: 'Chequy Or and gules', see: ['barry'] },
  { id: 'semy', term: 'Semy', definition: 'Strewn with small charges, too many to count, some of them cut off at the edges. The old arms of France were azure, semy of fleurs-de-lis Or. The maker does not draw it yet.', see: ['charge'] },
  { id: 'counterchanged', term: 'Counterchanged', definition: 'Of a charge laid over a divided field: taking the two tinctures of the field in reverse, so that each half of the charge contrasts with the half of the field behind it. The maker does not draw it yet.', see: ['division'] },

  // Lines
  { id: 'line-of-partition', term: 'Line of partition', definition: 'The line along which a field is divided or an ordinary is edged. It is straight unless the blazon names another: engrailed, indented, wavy, embattled, and many more.', see: ['engrailed', 'indented', 'wavy', 'embattled'] },
  { id: 'engrailed', term: 'Engrailed', definition: 'Of a line: scalloped, in a row of small curves whose points turn outwards.', figure: 'Or, a bend engrailed sable', see: ['line-of-partition'] },
  { id: 'indented', term: 'Indented', definition: 'Of a line: zigzag, in small teeth like the edge of a saw.', figure: 'Per fess indented gules and argent', see: ['line-of-partition'] },
  { id: 'wavy', term: 'Wavy', definition: 'Of a line: rising and falling in waves. It is the usual way to say water.', figure: 'Per fess wavy azure and argent', see: ['line-of-partition'] },
  { id: 'embattled', term: 'Embattled', definition: 'Of a line: cut into square battlements like the top of a castle wall. A fess, bend or chevron is embattled on its upper edge only.', figure: 'Argent, a fess embattled gules', see: ['line-of-partition'] },

  // Ordinaries
  { id: 'ordinary', term: 'Ordinary', definition: 'One of the simple geometric bands that are the oldest charges of all: the chief, pale, fess, bend, chevron, cross, saltire, bordure and pile.', see: ['charge', 'sub-ordinary', 'diminutive'] },
  { id: 'chief', term: 'Chief', definition: 'A band across the top of the shield, taking about a third of it. Also the name for the top of the shield as a place.', figure: 'Gules, a chief argent', see: ['ordinary', 'base'] },
  { id: 'pale', term: 'Pale', definition: 'An upright band down the middle of the shield.', figure: 'Gules, a pale Or', see: ['ordinary', 'per-pale', 'in-pale'] },
  { id: 'fess', term: 'Fess', definition: 'A level band across the middle of the shield.', figure: 'Gules, a fess argent', see: ['ordinary', 'per-fess', 'in-fess'] },
  { id: 'bend', term: 'Bend', definition: 'A diagonal band from the top on the dexter side to the bottom on the sinister. Charges on a bend slant with it.', figure: 'Azure, a bend Or', see: ['ordinary', 'per-bend', 'in-bend'] },
  { id: 'chevron', term: 'Chevron', definition: 'A band bent into a point like the rafters of a roof.', figure: 'Azure, a chevron Or', see: ['ordinary', 'per-chevron'] },
  { id: 'cross', term: 'Cross', definition: 'An upright band and a level band crossing in the middle and reaching the edges of the shield.', figure: 'Argent, a cross gules', see: ['ordinary', 'in-cross'] },
  { id: 'saltire', term: 'Saltire', definition: 'A diagonal cross, in the shape of a letter X.', figure: 'Azure, a saltire argent', see: ['ordinary', 'per-saltire', 'in-saltire'] },
  { id: 'pile', term: 'Pile', definition: 'A wedge coming down from the top of the shield to a point near the base.', figure: 'Or, a pile gules', see: ['ordinary'] },
  { id: 'bordure', term: 'Bordure', definition: 'A border round the edge of the shield. It is often added to arms to tell a younger branch of a family from the main line.', figure: 'Gules, a bordure Or', see: ['ordinary', 'cadency'] },
  { id: 'diminutive', term: 'Diminutive', definition: 'A narrower version of an ordinary, usually borne in twos or more: the bar is the diminutive of the fess, the pallet of the pale, the bendlet of the bend. The maker does not draw them yet.', see: ['ordinary'] },
  { id: 'sub-ordinary', term: 'Sub-ordinary', definition: 'One of the lesser geometric charges, such as the canton (a square in the upper corner), the orle (a narrow band set in from the edge) and the lozenge. The maker does not draw them yet.', see: ['ordinary'] },
  { id: 'between', term: 'Between', definition: 'The word that puts charges around an ordinary, on the field: a fess between three crescents. On puts them on the ordinary itself.', figure: 'Gules, a fess argent between three crescents Or', see: ['ordinary', 'charge'] },

  // Charges
  { id: 'charge', term: 'Charge', definition: 'Anything placed on the field: an ordinary, a star, a beast, a tool. A blazon names each charge, how many there are, how they lie and their tincture.', see: ['ordinary', 'attitude', 'modern-charge'] },
  { id: 'mullet', term: 'Mullet', definition: 'A star with straight points, five unless the blazon gives another number. The name comes from the French for the rowel of a spur.', figure: 'Gules, a mullet argent', see: ['charge'] },
  { id: 'crescent', term: 'Crescent', definition: 'A crescent moon with its horns pointing up.', figure: 'Azure, a crescent argent', see: ['charge'] },
  { id: 'annulet', term: 'Annulet', definition: 'A plain ring: a roundel with its middle cut away.', figure: 'Sable, an annulet Or', see: ['roundel'] },
  { id: 'fleur-de-lis', term: 'Fleur-de-lis', definition: 'A stylised lily of three petals tied with a band, best known from the arms of the kings of France. The plural is fleurs-de-lis.', figure: 'Azure, a fleur-de-lis Or', see: ['charge'] },
  { id: 'lion', term: 'Lion', definition: 'The commonest beast in heraldry. It is rampant unless the blazon gives another attitude, and faces dexter.', figure: 'Or, a lion rampant sable', see: ['attitude', 'rampant', 'passant'] },
  { id: 'eagle', term: 'Eagle', definition: 'The commonest bird in heraldry, and the emblem of emperors. It is nearly always shown displayed.', figure: 'Argent, an eagle displayed gules', see: ['displayed', 'rising'] },
  { id: 'bezant', term: 'Bezant', definition: 'A gold roundel, named after the gold coin of Byzantium.', figure: 'Azure, a bezant', see: ['roundel'] },
  { id: 'plate', term: 'Plate', definition: 'A silver roundel, as flat and white as a silver dish.', figure: 'Azure, a plate', see: ['roundel'] },
  { id: 'torteau', term: 'Torteau', definition: 'A red roundel. The plural is torteaux.', figure: 'Or, a torteau', see: ['roundel'] },
  { id: 'hurt', term: 'Hurt', definition: 'A blue roundel, perhaps named after the whortleberry.', figure: 'Argent, a hurt', see: ['roundel'] },
  { id: 'pomme', term: 'Pomme', definition: 'A green roundel, from the French for apple.', figure: 'Argent, a pomme', see: ['roundel'] },
  { id: 'pellet', term: 'Pellet', definition: 'A black roundel, also called an ogress or a gunstone.', figure: 'Argent, a pellet', see: ['roundel'] },
  { id: 'golpe', term: 'Golpe', definition: 'A purple roundel, the rarest of the seven.', figure: 'Or, a golpe', see: ['roundel'] },
  { id: 'martlet', term: 'Martlet', definition: 'A small bird like a swallow, drawn without feet. In the English system of cadency it is the mark of a fourth son.', see: ['cadency'] },
  { id: 'modern-charge', term: 'Modern charge', definition: 'The maker’s name for its charges that the Middle Ages did not have, or did not draw this way: an anchor, a cogwheel, a locomotive, a tractor. Each is one flat shape in one tincture.', figure: 'Vert, a tractor Or', see: ['charge'] },

  // Attitudes
  { id: 'attitude', term: 'Attitude', definition: 'The pose of a beast or bird: rearing, walking, sitting, lying, with wings spread. The attitude is part of the blazon and changes the arms.', see: ['rampant', 'passant', 'displayed', 'guardant'] },
  { id: 'rampant', term: 'Rampant', definition: 'Rearing up on one hind leg with the forepaws raised. The usual attitude of a lion.', figure: 'Azure, a lion rampant Or', see: ['attitude', 'lion'] },
  { id: 'rampant-guardant', term: 'Rampant guardant', definition: 'Rearing up, with the face turned to the viewer.', figure: 'Vert, a lion rampant guardant argent', see: ['rampant', 'guardant'] },
  { id: 'passant', term: 'Passant', definition: 'Walking, with one forepaw raised and the other three on the ground.', figure: 'Gules, a lion passant Or', see: ['attitude', 'lion'] },
  { id: 'passant-guardant', term: 'Passant guardant', definition: 'Walking, with the face turned to the viewer: the attitude of the three lions of England. French heralds call a lion in this pose a leopard.', figure: 'Gules, three lions passant guardant in pale Or', see: ['passant', 'guardant'] },
  { id: 'statant', term: 'Statant', definition: 'Standing still, with all four paws on the ground.', figure: 'Vert, a lion statant Or', see: ['attitude'] },
  { id: 'statant-guardant', term: 'Statant guardant', definition: 'Standing still, with the face turned to the viewer.', figure: 'Gules, a lion statant guardant Or', see: ['statant', 'guardant'] },
  { id: 'salient', term: 'Salient', definition: 'Leaping, with both hind paws on the ground and both forepaws in the air.', figure: 'Gules, a lion salient argent', see: ['attitude'] },
  { id: 'courant', term: 'Courant', definition: 'Running at full stretch, legs flung out before and behind.', figure: 'Vert, a lion courant Or', see: ['attitude'] },
  { id: 'sejant', term: 'Sejant', definition: 'Sitting on its haunches with the forepaws on the ground.', figure: 'Or, a lion sejant gules', see: ['attitude', 'sejant-erect'] },
  { id: 'sejant-erect', term: 'Sejant erect', definition: 'Sitting upright on its haunches with the forepaws raised.', figure: 'Azure, a lion sejant erect Or', see: ['sejant'] },
  { id: 'couchant', term: 'Couchant', definition: 'Lying down with the head raised and alert.', figure: 'Or, a lion couchant gules', see: ['attitude', 'dormant'] },
  { id: 'dormant', term: 'Dormant', definition: 'Lying down asleep, with the head resting on the forepaws.', figure: 'Sable, a lion dormant Or', see: ['couchant'] },
  { id: 'guardant', term: 'Guardant', definition: 'Of a beast: with its face turned to look out of the shield at the viewer, whatever its body is doing.', figure: 'Gules, a lion passant guardant Or', see: ['attitude', 'passant-guardant'] },
  { id: 'displayed', term: 'Displayed', definition: 'Of a bird: facing the viewer with wings, legs and tail spread. The usual attitude of an eagle.', figure: 'Or, an eagle displayed sable', see: ['eagle', 'rising'] },
  { id: 'rising', term: 'Rising', definition: 'Of a bird: standing with its wings lifted, about to take flight.', figure: 'Argent, an eagle rising sable', see: ['eagle', 'displayed'] },

  // Arrangements
  { id: 'two-and-one', term: 'Two and one', definition: 'Two above and one below, following the taper of the shield. Three charges lie this way unless the blazon says otherwise, so it usually goes unsaid.', figure: 'Azure, three mullets Or', see: ['in-pale', 'in-fess'] },
  { id: 'in-pale', term: 'In pale', definition: 'Of charges: one above another in an upright line. Not to be confused with per pale, which divides the field.', figure: 'Azure, three mullets in pale Or', see: ['pale', 'per-pale'] },
  { id: 'in-fess', term: 'In fess', definition: 'Of charges: side by side in a level row.', figure: 'Azure, three mullets in fess Or', see: ['fess'] },
  { id: 'in-bend', term: 'In bend', definition: 'Of charges: in a diagonal line, running the way a bend runs.', figure: 'Azure, three mullets in bend Or', see: ['bend'] },
  { id: 'in-cross', term: 'In cross', definition: 'Of charges: laid out in the shape of a cross.', figure: 'Gules, five bezants in cross', see: ['cross'] },
  { id: 'in-saltire', term: 'In saltire', definition: 'Of charges: laid out in the shape of an X, one in the middle and one towards each corner. Five charges lie this way unless the blazon says otherwise.', figure: 'Vert, five plates', see: ['saltire'] },

  // Around the shield
  { id: 'crest', term: 'Crest', definition: 'The figure that stands on top of the helm above the shield. It is one part of an achievement and not another word for a coat of arms.', see: ['achievement', 'helm'] },
  { id: 'helm', term: 'Helm', definition: 'The helmet shown above the shield. In some countries its style and the way it faces show the rank of the bearer.', see: ['achievement', 'crest'] },
  { id: 'mantling', term: 'Mantling', definition: 'The cloth that hangs from the helm and curls round the shield, usually in the main colour and metal of the arms. It began as a cover against the sun.', see: ['achievement', 'helm'] },
  { id: 'supporters', term: 'Supporters', definition: 'The figures that stand either side of the shield and hold it up, such as the lion and unicorn of the United Kingdom. They are usually a mark of high rank.', see: ['achievement'] },
  { id: 'motto', term: 'Motto', definition: 'A word or short phrase on a scroll, usually below the shield. It is not part of the arms and may be changed at will.', see: ['achievement'] },
  { id: 'banner-of-arms', term: 'Banner of arms', definition: 'A flag that shows the design of the shield, stretched to fill the whole cloth.', see: ['coat-of-arms'] },
  { id: 'canting-arms', term: 'Canting arms', definition: 'Arms that make a pun on the bearer’s name: a lion for León, a castle for Castile, a bear for Berne.', figure: 'Argent, three ravens sable', see: ['charge'] },

  // Marshalling and cadency
  { id: 'marshalling', term: 'Marshalling', definition: 'Putting two or more coats of arms on one shield, to show a marriage, an office, an inheritance or a union of realms.', see: ['impalement', 'quartering'] },
  { id: 'impalement', term: 'Impalement', definition: 'Two coats side by side on one shield, each in its own half. It shows a marriage or an office, and lasts only as long as that does.', figure: 'Per pale gules and azure', see: ['marshalling', 'dimidiation'] },
  { id: 'dimidiation', term: 'Dimidiation', definition: 'An early way of joining two coats: the dexter half of one set against the sinister half of the other. It made strange hybrids and gave way to impalement.', see: ['impalement'] },
  { id: 'quartering', term: 'Quartering', definition: 'Several coats on one shield, each whole in its own quarter. It shows inheritance, and a shield may gather many quarterings over the centuries.', figure: 'Quarterly gules and Or', see: ['marshalling', 'quarterly'] },
  { id: 'escutcheon-of-pretence', term: 'Escutcheon of pretence', definition: 'A small shield placed in the middle of a larger one, bearing arms the owner claims to represent, such as those of an heiress he has married.', see: ['marshalling'] },
  { id: 'cadency', term: 'Cadency', definition: 'The ways of changing a family’s arms slightly so that each member or branch has a version of its own.', figure: 'Gules, a lion rampant Or, a bordure argent', see: ['brisure', 'label', 'bordure'] },
  { id: 'brisure', term: 'Brisure', definition: 'A mark of cadency: a small charge or other change added to the family arms to difference them.', see: ['cadency', 'label'] },
  { id: 'label', term: 'Label', definition: 'A narrow bar across the top of the shield with tags hanging from it, usually three. It is the mark of an eldest son in his father’s lifetime, and of royal children.', see: ['cadency'] },
  { id: 'baton-sinister', term: 'Baton sinister', definition: 'A narrow diagonal bar from the sinister side that stops short of the edges of the shield. In England it marked some royal children born outside marriage. It is what novelists mean by a bar sinister.', see: ['cadency'] },
];

/** The glossary, in alphabetical order. */
export const glossary: readonly GlossaryEntry[] = entries.sort((a, b) => a.term.localeCompare(b.term, 'en', { sensitivity: 'base' }));
