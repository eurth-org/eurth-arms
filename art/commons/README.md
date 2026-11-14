# Heraldic art from Wikimedia Commons

The lions and eagles Arms draws are not ours. They are these files from [Wikimedia Commons](https://commons.wikimedia.org), kept here unchanged, as downloaded on 14 and 15 November 2026. `tools/beasts.py` turns them into the modules in `src/arms/beasts/`, where their colours become roles so that a beast can be painted in any tincture. Nothing else is changed.

These files are **not** under this repository's Apache 2.0 licence. Each keeps its own:

| File | Author | Licence |
| --- | --- | --- |
| [Lion Rampant.svg](https://commons.wikimedia.org/wiki/File:Lion_Rampant.svg) | Sodacan | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) |
| [Lion Rampant Guardant.svg](https://commons.wikimedia.org/wiki/File:Lion_Rampant_Guardant.svg) | Sodacan | CC BY-SA 3.0 |
| [Lion Passant.svg](https://commons.wikimedia.org/wiki/File:Lion_Passant.svg) | Sodacan | CC BY-SA 3.0 |
| [Lion Passant Guardant.svg](https://commons.wikimedia.org/wiki/File:Lion_Passant_Guardant.svg) | Sodacan | CC BY-SA 3.0 |
| [Lion Statant.svg](https://commons.wikimedia.org/wiki/File:Lion_Statant.svg) | Sodacan | CC BY-SA 3.0 |
| [Lion Statant Guardant.svg](https://commons.wikimedia.org/wiki/File:Lion_Statant_Guardant.svg) | Sodacan | CC BY-SA 3.0 |
| [Lion Salient.svg](https://commons.wikimedia.org/wiki/File:Lion_Salient.svg) | Sodacan | CC BY-SA 3.0 |
| [Lion Sejant.svg](https://commons.wikimedia.org/wiki/File:Lion_Sejant.svg) | Sodacan | CC BY-SA 3.0 |
| [Lion Sejant Erect.svg](https://commons.wikimedia.org/wiki/File:Lion_Sejant_Erect.svg) | Sodacan | CC BY-SA 3.0 |
| [Lion Couchant.svg](https://commons.wikimedia.org/wiki/File:Lion_Couchant.svg) | Sodacan | CC BY-SA 3.0 |
| [Lion Dormant.svg](https://commons.wikimedia.org/wiki/File:Lion_Dormant.svg) | Sodacan | CC BY-SA 3.0 |
| [Lion Courant.svg](https://commons.wikimedia.org/wiki/File:Lion_Courant.svg) | Sodacan | CC BY-SA 3.0 |
| [Coa Illustration Elements Animal Eagle v2.svg](https://commons.wikimedia.org/wiki/File:Coa_Illustration_Elements_Animal_Eagle_v2.svg) | Madboy74 | Public domain |
| [Coa Illustration Elements Animal Eagle Rising Wings Addorsed and Elevated.svg](https://commons.wikimedia.org/wiki/File:Coa_Illustration_Elements_Animal_Eagle_Rising_Wings_Addorsed_and_Elevated.svg) | Arthur Charles Fox-Davies, *A Complete Guide to Heraldry* (1909), vectorised on Commons | Public domain |

Commons lists three of the lions (passant guardant, statant, statant guardant) with no author field; they were uploaded as own work in the same series and are credited to Sodacan with the rest.

## What the lions' licence asks

CC BY-SA 3.0 lets anyone use and change the lions, on two conditions that Arms passes on:

- **Credit.** Wherever a lion is shown or saved, name Sodacan, link the licence and say it was changed (recoloured). Arms writes this into every picture it saves that has a lion in it, and says so in its footer.
- **Share alike.** A picture made with a lion is under CC BY-SA 3.0 too. Arms tells the person so beside the download buttons.

The eagles are in the public domain and ask for nothing; they are credited anyway.

## Adding a beast

Only files that are in the public domain, or whose licence allows re-use and changes (CC0, CC BY, CC BY-SA), and never ones marked non-commercial or no-derivatives. Download the file here, add a row above, add it to `SOURCES` in `tools/beasts.py` with its author and licence exactly as Commons states them, and run `python3 tools/beasts.py`.
