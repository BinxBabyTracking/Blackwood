# C001 The Whitmore File: canonical timeline

Internal case-authoring data. Players never see this as a whole; they rebuild it from statements, interviews and evidence. Every line of dialogue, the police statements, the case file and the closing report agree with it, and `npm run check:case` guards the parts that can be checked mechanically.

Status: provisional, approved for Step 6 with one correction (Daniel's departure, below).

## Friday, August 16, 1985

| Time | Event | Where the player learns it |
| --- | --- | --- |
| 7:00 PM | Guests begin arriving. Margaret first. | Case file, Margaret |
| 8:00 PM | Supper underway. | Det. Bennett |
| 9:15 PM | Eleanor takes Daniel to her writing desk, ledger open, for about ten minutes. | Margaret, Patricia, Robert; Daniel calls it routine |
| 10:00 PM | Robert Hale leaves. | Robert, Margaret, tape 3 |
| 10:10 PM | Margaret Ellis leaves. | Margaret, tape 1 |
| 10:20 PM | Patricia Wells leaves. Daniel still in the house. | Patricia, tape 4 |
| 10:25 PM | Daniel Mercer leaves, the last guest (his account). | Daniel, tape 2 |
| 10:30 PM | Eleanor alone. Washes up (drying rack). | Kitchen scene, Bennett |
| ~10:40 PM | Daniel at the Maple Street Diner, served by Linda. | Daniel (claims he stayed until 1:00) |
| 11:00 PM | Linda clocks out. Rosa starts the night shift. | E13 shift sheet, Rosa, Bennett |
| ~11:05 PM | Man in a tan jacket leaves the window booth without paying for a refill. | E04 diner note, Rosa |
| 11:20 PM | Daniel returns to Hollister Avenue; parks under the jacaranda, lights off. | Closing report only |
| 11:30 PM | Late news ends; Margaret dozes in her chair. | Margaret, TV Guide hotspot |
| 11:35 PM | Fatal confrontation in the living room. | Closing report only |

## Saturday, August 17, 1985

| Time | Event | Where the player learns it |
| --- | --- | --- |
| 12:10 AM | Margaret, woken by the cat, sees a dark four-door sedan with a crumpled rear fender. | Margaret's call (RE01), Margaret |
| 12:15 AM | Daniel drives away (after staging the screen and bolt and taking the folder). | Closing report only |
| 12:30 AM | Sedan gone. | Margaret |
| 7:40 AM | Margaret finds Eleanor, using her spare key. Front door locked. | Case file, Margaret, tape 1 |
| 9:02 AM | Rexall receipt: gauze, tape, iodine. | Daniel's wastebasket (state A) |
| 10:15 AM to 5:20 PM | Bennett records the four statements. | Tapes |

Other fixed points: coroner's preliminary estimate 11:00 PM to 1:00 AM (an estimate, not a result); appointment with Mr. Albright Monday the 19th (E09); investigator receives the file Monday the 26th (intro).

## Validation against the evidence

| Check | Result |
| --- | --- |
| Diner observation (E04) and shift sheet (E13) | Consistent. Linda off at 11:00, tan-jacket customer out at ~11:05, at Hollister by 11:20 (about 15 minutes' drive). |
| Blood evidence (E02, E11, E14) | Consistent. Struggle at 11:35 sits inside the coroner's window; the hand was bandaged by Saturday afternoon's statement and the Rexall receipt is 9:02 Saturday. No new forensic result was added in dialogue; Bennett defers to the written reports. |
| Sedan sighting | Consistent after correction: seen 12:10, Daniel departs 12:15, gone by 12:30. |
| Statements | All four on Saturday 8/17; times match the table; none names the culprit. |

## Contradictions found in the earlier draft, and how they were resolved

1. **Day of the week.** August 16, 1985 was a Friday; the draft said Saturday the 17th, with discovery on Sunday the 18th. Moved everything one day earlier (calendar, TV Guide, receipt, front door and back door notes, statements, case file, closing report).
2. **Daniel's departure and the sedan.** The brief had Daniel leaving at 11:45 PM but the sedan seen at 12:10 AM. Approved correction: Daniel departs at 12:15 AM.
3. **Departure times.** The draft had Robert 10:20, Margaret 10:35, Daniel 10:45, Patricia 10:50, which breaks "Eleanor alone at 10:30". Now 10:00, 10:10, 10:20, 10:25.
4. **Diner times.** The draft had the customer leave at 11:20, the same minute Daniel returns. Now ~11:05.
5. **Margaret's sighting.** The draft had her let the cat in "after the news" at 12:15, but the news ends at 11:30. She now dozes and is woken by the cat at 12:10.
6. **Coroner window.** The draft said 11:30 PM Saturday to 1:30 AM Sunday. Now a preliminary 11:00 PM Friday to 1:00 AM Saturday.

## Document evidence

E03, E04, E09, E11, E12, E13 and E15 carry their full text in `src/cases/C001/evidence.ts`, using the times above. Blood typing (E11, with the E05 supplement): Eleanor Group A; the glass's broken edge Group B; comparison samples Ellis O, Wells A, Hale B, Mercer B. Typing narrows the source to Hale or Mercer; the hand injury separates them.
