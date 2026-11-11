# CHR001 The Christmas That Never Happened: canonical timeline and build contract

Written before any dialogue. Everything in `src/cases/CHR001/` and the Godot client must agree with this file. Sources: the project docs "CHR001 Design Handoff" (v1.0, the brief) and "CHR001 Case Design" (v0.1 and its decisions). This file supersedes the case design where they differ; the differences are listed under "Changes from the design".

Seasonal: December only (`available_month` 12). 1 to 6 investigators. Price set after playtests. About 3 to 5 hours (estimate). Built for the Godot client: one walkable North Pole, no map.

## Changes from the design

- **Players: 1 to 6**, like every other case (the handoff said 4 to 10). Every rule below works for one player.
- **Look:** bright, whimsical animated-film fantasy. Elves are small, round, gnome-like folk about half a grown person's height; Santa and Mrs. Claus are full-sized. Dialogue is playful and warm; the murder is still a murder, told without gore.
- **Where loop 1 starts.** Loop 1 starts at the clock tower at 12:20 PM, where the investigators have just arrived; every later loop starts in the Jingle Division office at 8:00 AM. (`startLocation` is `jingle_office`; loop 1 overrides it.)
- **Aldric's keys (CE007).** Aldric hangs his key ring on the KEEPER'S KEYS hook while he works at the bench, and wears it on his belt chain when he leaves the workshop. Garrick takes it from the hook. Before the murder the keys are on the hook (or on Aldric).
- **Garrick leaves by the square, not the stables.** After hiding the Chronometer he climbs up the old well and out through its grate onto the square while everyone is running to the tower, so Dasha never sees him come back out of the boiler room. Corwin sees him arrive back on Clockmakers' Row at about 12:30 with soot on his sleeve (a new fact for Corwin, and the red herring's one true clue).
- **Aldric's spring visit to the Archives** is in the visitor log too: "Apr 3. Aldric. Guild records, the rebuilding." It shows Aldric looked into the Thorne gear eight months before Garrick did.
- **The gear puller (CE031)** was borrowed by Aldric on Dec 19 to lift the bloodline gears out at the evening winding. It is on his workshop shelves.
- **The clock runs in real time** (1 in-world minute = 5 real seconds), shared by everyone, not on actions as in HALLOW001. See "The clock".

## Setting

Santa's North Pole on Christmas Eve, a timeless storybook elf village in the polar night (the sun never rises; aurora all day). No phones: a brass bell-tube network links the Jingle Division office, Santa's office, the Guard house, the Archives and the Lab. The Bureau's frost-plate camera takes photographs, which are filed like notes.

**The Christmas Chronometer.** A great golden pocket watch about eight inches across, kept in a glass case on a pedestal in the Chronometer chamber at the top of the clock tower. Each Christmas Eve, at the evening winding (6:00 PM), it is wound and set, and while Santa flies it stretches the night long enough for every delivery. To do it, each of its twelve **bloodline gears** turns once and takes a few days of life from one of the twelve founding elf families, shared across the family. Nobody notices a few days.

**Who pays.** Each bloodline gear takes from everyone in its house, by blood or by marriage.

**The fault.** When the Chronometer was rebuilt in 1621, Edwin Thorne, master clockmaker, Garrick's great-great-grandfather, cut the Thorne gear. One tooth is miscut. Every Christmas Eve the Thorne gear slips and turns twelve times instead of once: for 400 years the Thornes have given twelve times their share, years rather than days, and it falls hardest on whoever in the family is youngest and has the most life to give.

**The Keeper's Bond.** Written into Santa's founding charter: the Keeper of Time is bound to the Chronometer. If the Keeper dies on Christmas Eve, the Chronometer chimes, writes "4 HOURS REMAIN" where the Keeper fell, holds the day open four hours (so that a new Keeper might be found), then rings the whole North Pole back to the day's first winding at 8:00 AM. It has never happened before. Nobody alive remembers the clause; it is in the Archives (CE019).

**Why the investigators remember.** Every Jingle Division badge is a small silver bell cast from the same silver as the clasp of Santa's Time Bag. What the Bag protects, the bells protect: the wearer's memory, the Bureau's notebook, board, photographs and transcripts. Nobody else wears one.

**Lifespans.** Elves live about 1,000 years. Aldric is 897. Garrick is 143. Mira is 62, young for an elf; she looks about eighty.

## Before Christmas Eve

| Date | Event | Where it is learned |
| --- | --- | --- |
| 1621 | The Chronometer is rebuilt. Edwin Thorne cuts the Thorne gear. | CE020 (guild record), Quill |
| about 1660 to now | The Thorne line ages fast. Few Thornes live past 500. Garrick's grandmother died at 410, his father at 380. | The Thornes' family book of ages (parlor; observation), Mira |
| 1612 | Aldric becomes Keeper of Time. He oversaw the 1621 rebuilding. | Pip, Santa |
| 1964 | Garrick marries Elsbeth. Mira is born 1964. | Mira, photographs (parlor) |
| 1989 | Elsbeth Thorne (née Larch), married into the family, dies at 241, "worn out early," the healer said. | Mira, Mrs. Claus |
| Spring this year (Apr 3) | Aldric notices the Thorne family's ages in the Tithe Register, reads the guild record of the rebuilding in the Archives, and finds the miscut tooth on paper. | Archives visitor log (CE016 page), CE021 |
| Apr to Dec | Aldric designs the Evergreen Chronometer (CE022). He asks Dr. Glint to build "a reservoir" to his drawings without telling her why (CE025). He retunes every clock in the village to run a hair fast, so the spare seconds collect in the globe. Corwin Sleet complains three times (CE030). | Glint, Corwin, Pip |
| Nov 12 | The healer writes to Mira: her years are passing far too quickly (CE018). | Mira, Mrs. Claus |
| Dec 14 | Aldric orders the escapement crystal from the glassworks for collection Dec 24 (CE023). | Glassworks order slip, Pip |
| Dec 19 | Aldric borrows Dr. Glint's gear puller (CE031). | Glint, Pip |
| Dec 20 | Garrick reads the Tithe Register in the Archives. Quill logs it (CE016). He sees "House of Thorne, twelve turnings" and believes the Chronometer itself is feeding on his family. | CE016, CE017, Quill |
| Dec 21, evening | Garrick goes to Aldric in the tower and demands he stop the Chronometer. Aldric, not ready and not wanting to raise false hope, says only: "Not tonight, not on Christmas Eve. Trust me." Garrick hears a refusal. He writes CE027 that night and starts sketching the Chronometer (CE028). | CE027, CE028; Pip heard raised voices from the gear gallery but not the words |
| Dec 21 | Garrick asks Mrs. Claus whether Santa "ever listens to anyone about the old magic." | Mrs. Claus |
| Dec 22 | Aldric books 2:00 PM on Christmas Eve with Santa: "To show you what I have made" (CE026). | Marigold, CE026 |

## Christmas Eve: the original day (no investigators)

This is what happens in loop 1 and in any later loop where nobody changes it. All times in-world.

| Time | Event | Where it is learned |
| --- | --- | --- |
| **8:00 AM** | **The first winding: the reset point.** Aldric winds the great tower clock and checks the Chronometer in the chamber. Garrick is at home with Mira. | Pip, Mira |
| 8:20 | Aldric comes down to his workshop; Pip arrives. Keys go on the hook. | Pip |
| 8:40 | Garrick walks Mira to the toy floor and goes on to his workshop on Clockmakers' Row. | Mira, Bertram, Corwin |
| 9:00 | Mira at her painting bench on the toy floor (all day). | Bertram, Mira |
| 9:30 | Corwin Sleet argues loudly with Aldric outside the tower about his retuned clocks. Many elves on the square see it. | Corwin, Bertram, Pip; the square's background elves |
| 10:00 | Aldric visits the Lab and looks at the globe under its sheet: "Nearly full." Glint thinks him odd and pleased. | Glint |
| 10:15 to 11:05 | Garrick on the toy floor checking the line clocks, as he does every Christmas Eve. | Bertram, Mira, CE011 |
| 10:30 | Aldric back in his workshop. | Pip |
| 11:10 | Garrick signs out on the toy floor shift board: "G. THORNE, STABLE CLOCK, 11:10" (CE011). | CE011, Bertram |
| 11:15 | Garrick walks into the stables, says he is checking the stable clock, and goes into the boiler room. Dasha sees him go in and never come out. | Dasha (CE012) |
| 11:16 to 11:33 | Garrick walks the steam tunnels to the tower cellar and climbs the ladder; he slides the hatch bolt open from below with a thin blade. | CE010 (soot, unbolted) |
| 11:30 | Aldric sends Pip to the glassworks for the escapement crystal. The hatch is bolted when Pip leaves. | Pip (CE009) |
| 11:33 | Garrick comes up through the hatch into the workshop. | CE010 |
| 11:35 to 11:46 | The confrontation. Garrick demands Aldric stop the Chronometer. Aldric again says not today, and will not say why. | Closing report only |
| 11:40 | Pip collects the crystal at the glassworks and chats with the glassblower. | Pip |
| **11:47** | **The murder.** Aldric turns back to his bench. Garrick takes the winding crank from its peg and strikes him once, from behind. The Chronometer chimes in the chamber above; "4 HOURS REMAIN" glows on the floor beside Aldric. The countdown begins. | CE001, CE002, CE003 |
| 11:48 to 11:52 | Garrick drags Aldric under the gear train and tears the gear guard loose to fake an accident, wipes the crank on a polishing rag and hangs it on the wrong peg, pushes the rag into the stove. | CE004, CE005, CE006 |
| 11:53 to 11:56 | Garrick takes the keys from the hook, climbs to the chamber, opens the case with the key, takes the Chronometer. | CE007, CE008 |
| 11:58 | Down the hatch, along the tunnels. | |
| **12:02 PM** | **Pip returns and finds Aldric.** The tower has no bell-tube, so he runs across the square to the Guard house, shouting. The square empties toward the tower. | Pip, Vell |
| 12:08 | Two guards reach the tower. | Vell |
| 12:10 | Captain Vell arrives, sends a runner to the Bureau. | Vell |
| 12:12 | Garrick, at the bottom of the old well, hides the Chronometer on the stone ledge beside the old bucket. | CE029, CE013, CE014 (lifting the grate knocks the well-house clock's winding rod, and the little clock starts running slow) |
| 12:15 | Garrick climbs up the well and out through the grate onto the empty side of the square, padlocks it, and walks to Clockmakers' Row. | CE013 |
| **12:20** | **Loop 1 begins. The investigators arrive at the tower** with Chief Inspector Ashby. | |
| 12:30 | Garrick reaches his workshop. Corwin, at his shop window, sees soot on his sleeve. | Corwin |
| 2:00 | Aldric's appointment with Santa (he never comes). Santa asks Marigold where he is. | Marigold, Santa |
| **3:47** | **The reset.** The Chronometer rings. Every bell at the North Pole answers. The day goes back to 8:00 AM. | |
| (6:00 PM) | The evening winding. Reached only in a loop where Aldric lives. | |
| (11:00 PM) | Santa leaves. Reached only in a loop where Aldric lives. | |

### Garrick's account (his knowledge, lies included)

He spent the morning on the toy floor and went to check the stable clock at 11:10, found it fine, came back through the stables and spent the rest of the morning at his workshop. He was never in the tower today. He has not spoken to Aldric "in days." He goes quiet about the Chronometer and the Register. When shown the Register, he says only that the Thornes have always died young. When shown Dasha's statement, he says he went into the boiler room to check the pressure clock and left by the yard door (there is none: the boiler room has only the stable door and the tunnel door). He never confesses unless caught in the act, or brought round (below), or cornered with no way out.

### Closing report only

Not said by anyone, anywhere, in the first loop: the words of the 11:35 confrontation; the blow; Garrick dragging Aldric; taking the keys and the Chronometer; the hiding place down the old well (it is found, not told, unless Garrick confesses).

## Christmas Eve when Aldric lives

From 8:00 AM in any loop after the first. Everyone follows the original day until something changes it.

| Time | Event |
| --- | --- |
| 2:00 PM | Aldric meets Santa (if he is alive and free) and shows him the blueprints. Santa is moved but cautious: "Show me tonight, at the winding." |
| 5:30 | Aldric prepares the chamber for the evening winding: the gear puller, the crystal, the blueprints. |
| **6:00** | **The evening winding.** Aldric opens the chamber; the senior technician (Garrick) attends by custom. This is the only time the Chronometer can be changed, and Garrick's second chance (see "Garrick"). |
| 6:00 to 8:00 | If the investigators have everything ready (see "The Evergreen Chronometer"), Aldric binds the new Chronometer. |
| 11:00 | Santa leaves. If the case is not closed by then, the day simply ends and the case can still be closed after (no reset when Aldric lives). |

## The clock

- One shared in-world clock on the server: **1 in-world minute = 5 real seconds** (12x), tunable. Loop 1 runs from 12:20 to 3:47 (about 17 real minutes); a full loop to a murder and its reset, 8:00 AM to 3:47 PM, about 39 real minutes.
- The clock never stops for one player. Interviews, searching and walking all happen in shared time.
- **Ringing ahead:** at the great bell in the Jingle Division office, the investigators can skip forward to a chosen time. Every investigator in the investigation must agree (each rings their badge). The skip stops at once on anything that matters: Garrick leaves a scheduled place, a guard is posted, an NPC arrives where an investigator is, any timed event in the tables above.
- On the hour, the tower bell strikes. Before the Chronometer is recovered, that and the glowing words are all the countdown the players get. Once an investigator holds the Chronometer, its face shows the exact time remaining.
- **Solo play:** a single investigator can also ring ahead alone; nothing else changes.

## Loops

- **Loop 1** begins at 12:20 PM at the tower. **Every later loop** begins at 8:00 AM in the Jingle Division office: the screen goes white, every bell rings, and the investigators are back at the table with the Time Bag glowing on its stand.
- **The countdown** starts only when Aldric dies, whenever that is, and lasts four in-world hours. If he dies at 12:20 the reset is at 4:20.
- **On reset** (in one locked step on the server; it runs once): the world goes back to the 8:00 AM snapshot; everyone forgets; injuries and deaths undo; doors, guards and objects go back; Garrick forgets everything he learned. Kept: the notebook, transcripts, photographs, board connections, discovered places, known codes, the Time Bag and what is in it.
- **No limit** on loops. The case stays solvable in every loop: nothing essential can be lost for good (see Evidence).
- **When Aldric lives** past where he would have died and the threat is dealt with (Garrick held or brought round), there is no countdown and no reset. If Garrick is still free, the day goes on with Garrick's second chance at 6:00 PM.

## The Time Bag

- Kept on its stand in the Jingle Division office; any investigator can open it there. Items go in from anywhere: an investigator who collects a bag-eligible item can send it to the Bag at once (it "keeps" from that moment).
- On reset, every original goes back to where it started; the copy in the Bag stays. Each kept item shows: **Collected: loop N. From: place. Kept by the Time Bag.**
- **Never in the Bag:** the Chronometer (the Bag will not close on it), people, the globe (too big), anything not actually collected. Photographs and statements are records and survive anyway.
- One copy per item per loop: putting an item in twice in the same loop does nothing; the server holds the Bag and refuses duplicate grants.
- The Bag cannot lose anything: there is no way to throw an item away.
- **What kept items do.** A kept item can be shown to anyone in a later loop. Nobody remembers its loop. The Guard treats a kept item as evidence only of itself (a bloody crank while the real one hangs clean confuses Captain Vell). Santa recognizes his Bag's magic (below).

## Convincing Santa

Shown the Time Bag holding an item that also exists, unchanged, in the world right now (a second set of Aldric's keys, a second crank, a second glassworks slip), Santa recognizes his own Bag's magic and believes the investigators. From then on in that loop he will:
- order Captain Vell to post any guards asked for (up to four);
- order the old well's grate opened;
- order Garrick held until the 6:00 PM winding (not longer without grounds; see Arrest);
- move his 2:00 PM appointment with Aldric earlier if asked.

He forgets on reset like everyone else; convincing him again takes one more showing.

## Arrest and custody

- Investigators can **detain** anyone; the Guard keeps someone in the cells only on grounds it can see in the current loop.
- **Grounds:** (1) caught in the act: crank in hand over Aldric, or the Chronometer case open with the keys; (2) a confession; (3) Santa's order (only until the 6:00 PM winding, then he is released because he is needed at the winding, unless (1) or (2) has happened by then).
- A wrongful detention (anyone but Garrick) is released at once by Vell and costs nothing but time; it also tells Garrick, if he sees or hears of it, that the Bureau is hunting.
- Garrick held on grounds (1) or (2) stays held for the rest of the day.

## Garrick: the killer (rule-driven)

Garrick's decisions come from a fixed list of moves scored by the game; the interview AI only writes what he says. Every decision is logged for testing with what he knew.

**He notices only what he could see or hear**: a guard at the tower door or on the square by the tower; an investigator who follows him within sight for more than a minute; the hatch bolted from above when he tries it; Aldric not in the workshop when he arrives; more than one person in the workshop with Aldric; being questioned about the tower, the tunnels or the Register; being shown CE027 or CE028 (his own papers). Hidden investigators (in the gear gallery, the tunnel alcove, the cellar behind the crates) are not seen unless he walks within a few feet of them or they move.

| Move | When | What happens |
| --- | --- | --- |
| Routine | 8:00 to 11:10 | As in the original day |
| Approach | 11:10 to 11:33 | Toy floor, stables, boiler room, tunnels, cellar, hatch |
| Hold | At the hatch or the tower door, he sees a guard, finds the hatch bolted, or more than one person with Aldric | Waits up to 30 minutes out of sight, then tries the tower's front door once at a quiet moment; if that fails too, gives up until the evening winding |
| Confront | In the workshop, alone with Aldric | As the original day: the murder at the end of the confrontation, about 14 minutes after he arrives |
| Interrupted | Anyone enters during the confrontation | No murder. He leaves by the hatch if he can, otherwise says he came to talk |
| Hide | After a theft | The old well (12:12 if on the original timing) |
| Evening attempt | 6:00 PM winding, if he is free and has not been brought round | Attends as technician; when the chamber opens he tries to take the Chronometer. Two or more investigators or a guard in the chamber: he does not try. One investigator: he tries, and is caught in the act |
| Flee | He knows he is suspected (questioned twice about the tower or tunnels, shown his own papers, or sees a guard posted at his workshop), or the evening attempt fails | Heads for the supply sleigh in the hangar; leaves at 9:00 PM if not stopped. In the hangar he can be caught |
| Surrender | Cornered: in a room with investigators and a guard and no way out, or held and shown CE005 with CE006 | Confesses |
| Brought round | Shown CE020, CE021 and CE022 together, before he has killed in this loop | Breaks down, confesses what he planned, will not attack; offers to help Aldric with the Thorne gear |

Garrick never learns the loop number, the Time Bag, the board or anything from an earlier loop. Being told about earlier loops means nothing to him ("That's a strange thing to say on Christmas Eve").

**Sting operations** are built from ordinary actions: warn Aldric (he believes a stranger's warning only if shown CE002 in a photograph, or a kept item like the bloody crank; otherwise he laughs it off and stays at his bench); ask Vell for guards (two; up to four with Santa's order); hide in valid places; bolt the hatch; swap the Chronometer for the decoy watch from Corwin's counter (Aldric must agree, or the investigators need the keys); follow Garrick from the toy floor. Outcomes follow from what Garrick can see.

A successful sting (caught in the act) prevents the death, stops the countdown, gives grounds to hold him, keeps the Chronometer in its case, and adds CE032 (below).

## The Evergreen Chronometer

Needed for the true ending. Aldric binds it at the evening winding if, by 6:00 PM in a loop where he is alive and free:
1. he has been shown CE022 is safe (the blueprints, from the panel or the Bag) and told the investigators know;
2. the **escapement crystal** (CE024) is in the chamber (Pip brings it at 12:02 if nothing stops him; or the investigators bring it);
3. the **winter-glass globe** (CE025) has been moved from the Lab to the chamber (Glint does it with two guards if asked by Aldric or Santa; takes 40 minutes);
4. the **gear puller** (CE031) is in the chamber;
5. someone works the Thorne gear while Aldric holds the escapement: Garrick, brought round, does it in 20 minutes; Aldric alone needs Pip and an hour.

Then the old Chronometer's bloodline gears are stilled for good and the Evergreen Chronometer takes over. It never builds itself because the parts were found.

## Who is where (from 8:00 AM)

| Place | People |
| --- | --- |
| Jingle Division office | Chief Inspector Ashby (all day) |
| Aldric's workshop | Aldric (8:20 to 2:00, except 10:00 to 10:30 at the Lab); Pip (8:20 to 11:30, from 12:02) |
| Chronometer chamber | Aldric (8:00 to 8:20; 5:30 on) |
| Toy floor | Bertram (all day); Mira (9:00 on); Garrick (10:15 to 11:10) |
| Garrick's workshop | Garrick (8:40 to 10:15; 12:30 on) |
| The Thornes' parlor | Mira and Garrick (8:00 to 8:40) |
| Santa's office | Santa (all day, 2:00 PM with Aldric) |
| Marigold's office | Marigold (all day) |
| Kitchen | Mrs. Claus (all day) |
| Archives | Quill (all day) |
| Lab | Glint (all day) |
| Corwin's shop | Corwin (all day, except 9:20 to 9:45 at the tower) |
| Stables | Dasha (all day) |
| Guard house | Captain Vell and the guards (until 12:05; then at the tower in a loop where Aldric dies) |

## Evidence

"Bag" means it can be kept in the Time Bag. Photographs and statements are records and always survive. Every essential item has a second way in.

| ID | Title | Where and when | Bag | Essential | Second way |
| --- | --- | --- | --- | --- | --- |
| CE001 | Aldric's body | Workshop, after a death | photo | yes | n/a (first loop) |
| CE002 | The glowing words | Workshop, after a death | photo | yes | n/a |
| CE003 | Note on the wound | Glint, after examining a body | yes | yes | Mrs. Claus can examine instead |
| CE004 | The clean gear train | Workshop, after a death | photo | no | |
| CE005 | The winding crank | Workshop peg; on the wrong peg with traces after 11:52 | yes | yes | A sting (CE032) |
| CE006 | The burned rag | Workshop stove, after 11:52 | yes | yes (to tie Garrick) | Confession; CE032 |
| CE007 | Aldric's keys | Missing from the hook after 11:53; found in Garrick's coat (his workshop) or down the old well with the Chronometer | yes (the keys) | yes | Santa's master keys |
| CE008 | The empty case | Chamber, after 11:56 | photo | yes | A confession |
| CE009 | Pip's statement | Pip, any loop | statement | no | |
| CE010 | The unbolted hatch | Workshop floor, from 11:33 | photo | yes | CE012 with the tunnel sign |
| CE011 | The toy floor shift board | Toy floor, from 11:10 | photo | no | Bertram |
| CE012 | Dasha's statement | Dasha, from 11:15 | statement | yes | Following Garrick |
| CE013 | Soot on the well grate | Square, from 12:15 in a loop with a theft | photo | yes | Garrick's key ledger (CE015) |
| CE014 | The slow well-house clock | Square, from 12:12 in a loop with a theft | photo | no | |
| CE015 | The well-house key ledger | Garrick's workshop, locked cabinet (Garrick's key, or Santa's order) | yes | no | |
| CE016 | The Archives visitor log | Archives, any loop | yes (the page) | yes | Quill |
| CE017 | The Tithe Register | Archives lectern, any loop | photo | yes | Quill |
| CE018 | Mira's letters | Thornes' parlor, any loop (Mira gives them if asked kindly) | yes | yes | Mrs. Claus |
| CE019 | The Keeper's Bond | Archives, Quill finds it when asked about the Keeper or the words | yes | no | |
| CE020 | The Thorne gear | Archives, Quill finds it when asked about the Thorne gear or the rebuilding | yes | yes (for D and brought round) | |
| CE021 | Aldric's notebook | Behind the carved panel in the chamber (Aldric shows it, or the keys open the chamber) | yes | yes (for D) | Aldric |
| CE022 | The Evergreen blueprints | Same panel | yes | yes (for D) | Aldric |
| CE023 | The glassworks order | Glassworks desk, any loop | yes | no | Pip |
| CE024 | The escapement crystal | Glassworks case until 11:40; then with Pip | yes | yes (for D) | |
| CE025 | The winter-glass globe | Lab | photo only | yes (for D) | |
| CE026 | Santa's appointment book | Marigold's desk | yes (the page) | no | Marigold |
| CE027 | Garrick's note | Garrick's workbench, any loop | yes | yes | |
| CE028 | Garrick's sketches | Garrick's workshop wall, any loop | yes | no | |
| CE029 | The Christmas Chronometer | Down the old well from 12:12 in a loop with a theft; else the chamber | never | yes | A confession |
| CE030 | Corwin's letter | Corwin's counter, any loop | yes | no | |
| CE031 | The gear puller | Aldric's workshop shelves, any loop | yes | yes (for D) | Glint |
| CE032 | Caught in the act (Bureau report) | Made when a sting catches Garrick | record | no | |

**New: CE032, Caught in the act.** The Bureau's own report of the moment Garrick was stopped: where, when, what he held, who saw. Made automatically by a successful sting; counts as proof of the attempt for the Guard and the report.

## What each person knows

Interviews are written from these. Nobody remembers an earlier loop. Nobody names the killer. Everyone reacts naturally to "future" evidence: puzzled, curious, or alarmed.

- **Aldric** (alive in later loops): the Chronometer, the Keeper's Bond (vaguely: "an old clause, never needed"), the Thorne gear and his notebook, the Evergreen Chronometer (he admits it only when shown CE021 or CE022, or when Santa asks him), Garrick's Dec 21 visit ("he was angry and frightened; I asked him to trust me; I should have told him"), the 2:00 meeting. Believes a warning only with CE002 or a kept item.
- **Garrick**: his account (above). When brought round: everything, including the Dec 21 visit, the Register, his plan to take the Chronometer to "give back" Mira's years. He never confesses to a murder that has not happened in this loop; in a loop where he has killed, he confesses only when cornered.
- **Mira**: her father's moods since November; the healer's letters; her mother; the family's short lives ("we Thornes go early, everyone knows it"); her father left her at the toy floor at 8:45 and came back at 10:15; he went to the stables "after eleven."
- **Pip**: the morning (8:20 to 11:30); sent for the crystal at 11:30, hatch bolted when he left; Aldric "building something" since spring in the chamber, never said what; the gear puller; raised voices from the gear gallery on Dec 21 (words not heard); found the body at 12:02 (loop 1).
- **Santa**: Aldric, the Chronometer as he understands it (he does not know about the bloodline gears' unequal toll), the Bureau, his Time Bag; the 2:00 appointment. Convinced by the Bag (above).
- **Mrs. Claus**: Mira's health, Elsbeth, Garrick's question on Dec 21, everyone's comings and goings at the kitchen hatch (Garrick passed at 11:08 heading out).
- **Marigold**: the appointment (CE026), Santa's day.
- **Captain Vell**: the guards, the grounds for holding someone, the 12:02 alarm (loop 1).
- **Quill**: the visitor log (Garrick, Dec 20; Aldric, Apr 3); the Tithe Register; finds CE019 and CE020 when asked the right thing.
- **Glint**: the globe (built since spring to Aldric's drawings, purpose unknown); the gear puller lent Dec 19; Aldric's 10:00 visit; the wound (if she examines a body: CE003).
- **Corwin**: his grievance (CE030); the 9:30 argument; Garrick passing at 8:45 and returning at about 12:30 with soot on his sleeve.
- **Dasha**: Garrick into the boiler room at 11:15, never out; the boiler room has only two doors, the stable door and the tunnel door.
- **Bertram**: the shift board, Garrick on the floor 10:15 to 11:05, Mira's bench, the 9:30 argument (heard).
- **Chief Inspector Ashby**: the Bureau, the briefing (loop 1), the bell-tubes, the board; in later loops she does not know the investigators have lived the day before but listens.
- **Guards**: brief, formal statements.

## The report

Filed to Chief Inspector Ashby in the Jingle Division office once Aldric is alive and Garrick is held, or in any loop after the Chronometer has been recovered and Garrick named. It must name Garrick and show:

| Point | Evidence that proves it |
| --- | --- |
| How he got in unseen | CE010, CE011, CE012, CE015 |
| What he did or tried to do | CE003, CE005, CE006, CE008, CE032 |
| Why | CE016, CE017, CE018, CE027, CE028 |
| The Chronometer is safe | CE029 held, or in its case in a loop where it was never taken |

At least 4 key items, at most 7. Kept items from earlier loops count (the report is the Bureau's, and the Bureau remembers). Supporting, never held against it: CE001, CE002, CE009, CE019, CE020, CE021, CE022, CE030.

## Endings

Chosen when the report is accepted, first that holds:

| Ending | When |
| --- | --- |
| D Christmas Restored, Forever | Aldric alive, Garrick held, the Chronometer safe, the Evergreen Chronometer bound |
| A Christmas Restored | Aldric alive, Garrick held, the Chronometer safe |
| (B The Unfinished Christmas) | Not an ending: Aldric alive but Garrick free; the case stays open |
| (C Another Christmas Eve) | Not an ending: Aldric dies, the countdown runs, the day resets |

No loss endings: the case can always go on. A wrong report is returned as in every case.

## Contradictions found while writing

1. The design had the body found at 12:02 by Pip ringing the bell-tube, but the tower has no bell-tube. Pip runs across the square to the Guard house shouting; Vell sends a runner to the Bureau.
2. Dasha "never saw him come back out," yet Garrick had to return to his workshop. He leaves by the well grate onto the square while the crowd runs to the tower; Corwin sees him arrive back.
3. The design put the keys both on the hook and on Aldric. He hangs them on the hook while he works.
4. The design let Santa order Garrick held with no end. A Santa order lasts only until the 6:00 PM winding, so a sting or a confession is still needed.
5. The 6:00 PM winding needs Garrick by custom, but a held Garrick cannot attend. If he is held, Aldric winds alone (with Pip); the true ending then needs Garrick brought round and released to the chamber under guard, or Aldric and Pip's slow hour.
6. A countdown that starts at a late death could run past Santa's departure. It never does: Garrick kills only on the approach (before about 12:30) or at the evening winding, and a death at the winding (6:00 PM) resets at 10:00 PM, before Santa leaves.
