# Writing rules for this repo

Every page here is customer-facing PIO copy. The brand voice (Editorial Bone, Brand Guidelines v9) applies to all of it, whether written by a person or an agent.

## Mechanical rules (linted)

- British spelling always: optimise, behaviour, analyse, modelling, customise.
- No em-dashes or en-dashes. Use a hyphen, colon, parentheses, or full stop.
- Run `mise run lint` before committing; the baseline is empty and must stay empty.

## Voice rules

- No exclamation marks. No emoji. No hashtags.
- No bold as emphasis. At most one italicised word or phrase per paragraph.
- Every sentence carries a measurement, a verb, or a verdict. If a word can be deleted without loss, delete it.
- Sentences stay under thirty words.
- Banned words: amazing, thrilled, excited to share, unlock, supercharge, transform, disrupt, leverage, best-in-class, end-to-end, turnkey, "Get started now", "in minutes", "Click here".
- Errors and warnings: cause first, instruction second. Never "Oops", never "Sorry", never blame the reader.
- Buttons and labels: verb first, three words or fewer, sentence case, no trailing punctuation.

## Content rules

- Code in quickstart and integration pages is extracted from the compiling sample in pio-unity-sdk via markers. Never hand-write a code block that claims to be SDK usage.
- Do not document unreleased behaviour. Before the site launches (DNS cutover), under-construction stubs may sit in navigation; from launch, a page appears in navigation only when the surface it documents has shipped.
- Tell integrators to pin an exact SDK tag; the SDK is pre-1.0.
