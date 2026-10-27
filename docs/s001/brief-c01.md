# BLACKWOOD INVESTIGATIONS
# SERIES S001: THE JUDAS PRINCIPLE
# CASE S01 C01: THE LEDGER

## COMPLETE STORY BIBLE AND IMPLEMENTATION SPECIFICATION

You are implementing the first case of Blackwood Investigations' first connected investigative series.

This must integrate with the existing Blackwood game. Do not create a standalone application.

Inspect the existing codebase before implementing anything. Reuse its current office, location, interview, evidence, notebook, Murder Board, multiplayer, deduction, and persistence systems.

This case introduces a reusable series system and a second physical cork board that will persist across six investigations.

Do not implement future series cases yet. Build the infrastructure needed to support them.

---

# 1. CASE INFORMATION

**Series ID:** S001  
**Series title:** The Judas Principle  
**Case ID:** S001-C01  
**Player-facing ID:** S01 C01  
**Case title:** The Ledger  
**Location:** Bellwether County, Pennsylvania  
**Date:** November 2018  
**Estimated duration:** 110–140 minutes  
**Players:** 1–6  
**Difficulty:** Intermediate  
**Genre:** Financial crime, murder mystery, conspiracy thriller

## Case premise

Martin Keller, a 46-year-old accountant, is discovered murdered in his office.

Martin worked for the Bellwether Community Foundation, a nonprofit organization that distributes grants to local businesses, community programs, and families experiencing financial hardship.

Police initially suspect a robbery or personal dispute.

Martin's office was disturbed, several files are missing, and a desk drawer was forced open.

However, the player discovers that Martin had been investigating suspicious financial transactions involving the foundation.

The investigation reveals that a consulting firm called Meridian Advisory Group was receiving unexplained payments.

By the end of the case, Blackwood identifies Martin's murderer and uncovers evidence that the crime is connected to a larger financial network.

The individual murder is solved.

The larger investigation is only beginning.

---

# 2. SERIES RULES

The Judas Principle contains six connected cases.

S01 C01: The Ledger  
S01 C02: Room 614  
S01 C03: Dead Freight  
S01 C04: The Informant  
S01 C05: The Benefactor  
S01 C06: The Architect

The player must not be shown future case solutions, hidden characters, or the mastermind's identity.

## Series progression

Use a separate series progression record.

Suggested internal identifier:

`S001`

Suggested case identifier:

`S001-C01`

Player-facing label:

`S01 C01`

Future series must use independent progression records.

Do not mix standalone case progress with series case progress.

---

# 3. THE CANONICAL TRUTH

AUTHOR-ONLY INFORMATION.

Do not expose this information directly to the player.

## The criminal organization

Dr. Evelyn Voss secretly controls a criminal network through charitable organizations, consulting companies, financial intermediaries, and compromised individuals.

Meridian Advisory Group is a legitimate-looking consulting company used to coordinate financial transactions and other operations.

Adrian Cross oversees financial activity within the network.

Evelyn has become concerned that Adrian is moving money without her authorization.

She has quietly decided to let Blackwood expose some of Adrian's activities.

However, she does not intend to expose herself or the wider organization.

## Martin Keller

Martin was an experienced accountant employed by the Bellwether Community Foundation.

He was respected by colleagues and known for being meticulous.

Over several months, Martin discovered unusual transactions involving foundation grants.

He noticed that money was moving from the foundation to several small companies, then to Meridian Advisory Group.

Some payments were legitimate.

Others were fraudulent.

Martin began privately documenting the transactions.

He created a handwritten ledger containing dates, amounts, company names, and account references.

He also copied relevant financial records.

Martin intended to provide his findings to the foundation's board and an independent auditor.

## Adrian Cross

Adrian was using foundation-related contracts and shell companies to conceal unauthorized transfers.

He learned that Martin had been investigating the transactions.

Adrian wanted Martin's records recovered before they could be disclosed.

He hired Paul Reddick, a local contractor with a history of intimidation and theft.

Adrian instructed Paul to enter Martin's office after hours and recover the ledger and copied documents.

Adrian did not explicitly order Martin's murder.

## The murder

On November 8, 2018, Martin stayed late at the foundation's administrative office.

He intended to organize his findings before meeting an independent auditor the following morning.

Paul Reddick entered the building using an access credential obtained through a maintenance contract.

Paul expected the office to be empty.

Martin confronted him.

Paul demanded the financial records.

Martin refused.

During the confrontation, Paul struck Martin with a heavy brass desk ornament.

Martin collapsed and died from the injury.

Paul searched the office.

He stole a folder containing financial documents but failed to locate Martin's handwritten ledger, which Martin had concealed inside an old accounting reference book.

Paul disturbed the room to make the crime appear to be a burglary.

He left through the rear service entrance.

## After the murder

Paul contacted Adrian and reported that Martin was dead.

Adrian was alarmed but decided to conceal Paul's involvement.

He arranged a payment to Paul through a small contracting company.

He also attempted to identify and recover any remaining copies of Martin's records.

Adrian's actions after the murder create evidence of his involvement in the cover-up.

## Evelyn's involvement

Evelyn knew Adrian was conducting unauthorized financial activities.

She had not ordered Martin's murder.

After learning about the killing, she recognized an opportunity to expose Adrian's operation without implicating herself.

She cooperated with Blackwood and provided a genuine lead toward a suspicious contracting company.

She did this deliberately.

The information helps solve the murder.

It also advances Evelyn's private objective of weakening Adrian.

The player should not know this during S01 C01.

Evelyn must appear credible and helpful.

---

# 4. VICTIM

## Martin Keller

Age: 46  
Occupation: Senior accountant  
Employer: Bellwether Community Foundation  
Marital status: Divorced  
Children: One adult daughter  
Residence: Bellwether County, Pennsylvania

### Personality

Meticulous, quiet, principled, and cautious.

Martin disliked confrontation but believed financial misconduct should be reported.

### Relevant relationships

- Rebecca Keller: Daughter
- Susan Whitfield: Foundation executive director
- Adrian Cross: Outside financial consultant
- Paul Reddick: Contractor associated with the foundation's building
- Evelyn Voss: Prominent philanthropic partner
- Daniel Brooks: Independent auditor Martin intended to contact

### Cause of death

Fatal blunt-force head injury.

The weapon was a heavy brass desk ornament.

The murder occurred in Martin's office on November 8, 2018.

---

# 5. INTERVIEWABLE CHARACTERS

Implement 10 interviewable characters.

Each character requires:
- Character ID
- Name
- Age
- Occupation
- Portrait
- Biography
- Personality
- Relationship to Martin
- Knowledge boundaries
- Initial interview state
- Evidence-dependent responses
- Contradictions
- Re-interview conditions
- Final case state

## CH01: Rebecca Keller

Age: 24  
Occupation: Graduate student  
Role: Martin's daughter and client

Rebecca hires Blackwood after becoming dissatisfied with the robbery theory.

She knows Martin had become anxious about his work.

She recalls him mentioning irregular payments.

She is innocent.

She does not know who killed him.

### Important information

Martin recently told Rebecca:

"If anything happens to me, look at the numbers."

She also knows he kept an old accounting reference book on his office shelf.

This becomes important when locating the hidden ledger.

## CH02: Susan Whitfield

Age: 54  
Occupation: Foundation executive director

Susan manages the foundation's daily operations.

She knows Martin had raised concerns about unusual transactions.

She initially minimizes those concerns because she fears reputational damage.

She is innocent of murder.

She did approve several questionable consulting payments without fully reviewing them.

### Secret

Susan was warned that some transactions lacked adequate documentation.

She ignored the warnings.

She initially conceals this negligence.

## CH03: Adrian Cross

Age: 49  
Occupation: Financial consultant

Adrian is involved in the fraudulent transactions.

He hired Paul to steal Martin's records.

He helped conceal Paul's involvement after the murder.

He did not explicitly order the killing.

### Personality

Polished, analytical, impatient, and defensive when confronted with specifics.

### Initial story

He claims Martin was confused about legitimate consulting payments.

### Contradictions

His account conflicts with:
- Payment records
- Contracting company documents
- Paul Reddick's communications
- Building access records
- Post-murder financial transfers

## CH04: Paul Reddick

Age: 38  
Occupation: Maintenance contractor  
Role: Actual murderer

Paul entered Martin's office to steal financial records.

He killed Martin during the confrontation.

He staged the office disturbance.

### Initial story

Paul claims he completed routine maintenance earlier that day and left before evening.

### Contradictions

His statement conflicts with:
- Access logs
- Witness observations
- Physical evidence
- Vehicle records
- His post-murder payment

Paul must not confess immediately when confronted with a single suspicious clue.

## CH05: Evelyn Voss

Age: 52  
Occupation: Philanthropist and foundation founder

Evelyn is publicly associated with charitable work.

She is composed, articulate, and helpful.

She knows Adrian has been engaging in suspicious financial activity.

She provides a genuine lead to Blackwood.

### Critical author-only rule

Evelyn is the hidden mastermind of the entire series.

Do not reveal this in S01 C01.

Do not make her behave like an obvious villain.

Her answers must be factually consistent with the wider series.

She should never make a claim that later cases must contradict unless the contradiction is deliberately authored.

### Her useful lead

Evelyn tells Blackwood that a consulting invoice associated with a local contracting company deserves closer examination.

This is true.

It helps expose Adrian.

The player should perceive her as cooperative.

## CH06: Daniel Brooks

Age: 43  
Occupation: Independent auditor

Martin planned to meet Daniel the morning after his murder.

Daniel possesses a message from Martin describing concerns about financial irregularities.

He is innocent.

He can explain the accounting discrepancies in understandable terms.

## CH07: Thomas Avery

Age: 61  
Occupation: Building security supervisor

Thomas oversees access credentials and building entry records.

He knows Paul had legitimate maintenance access.

He initially assumes the access records are irrelevant.

He is innocent.

## CH08: Angela Morris

Age: 35  
Occupation: Foundation administrative assistant

Angela worked near Martin's office.

She noticed his increasing anxiety.

She also saw Paul near the building shortly before the murder.

She is innocent.

She initially worries that speaking to investigators could cost her job.

## CH09: Detective Robert Hayes

Age: 47  
Occupation: Bellwether Police Department detective

Robert is the primary police investigator.

He initially favors a robbery theory but remains open to evidence.

He is not corrupt.

He provides police reports and forensic updates through appropriate channels.

## CH10: Michael Foster

Age: 42  
Occupation: Local business owner

Michael received legitimate grants from the foundation.

He was also involved in a financial dispute with Martin.

He is a plausible early suspect.

He is innocent.

His financial dispute provides a red herring.

---

# 6. LOCATIONS

Implement 10 primary locations.

## L01: Blackwood Office

The existing office hub.

Contains:
- Case briefing
- Notebook
- Original Murder Board
- Desk
- Telephone
- Access to case locations

The wheeled series board is not present at the beginning.

## L02: Bellwether Community Foundation

Administrative offices.

Contains:
- Reception
- Staff work area
- Financial records
- Relevant witnesses
- Office access information

## L03: Martin Keller's Office

Primary murder scene.

Contains:
- Martin's desk
- Disturbed filing cabinet
- Bookshelf
- Hidden ledger
- Desk ornament location
- Physical evidence
- Relevant documents

The hidden ledger must require inspection of the bookshelf and accounting reference book.

## L04: Martin Keller's Residence

Contains:
- Personal correspondence
- Financial notes
- Family photographs
- Records showing his concerns

## L05: Rebecca Keller's Residence

Contains:
- Family information
- Martin's personal history
- Relevant conversations

## L06: Reddick Maintenance Services

Paul's contracting business.

Contains:
- Work schedules
- Equipment records
- Payment information
- Vehicle records

## L07: Bellwether Police Department

Contains:
- Police reports
- Interview records
- Forensic updates
- Detective Hayes

## L08: Independent Auditor's Office

Daniel Brooks's workplace.

Contains:
- Martin's planned appointment
- Financial analysis
- Relevant communications

## L09: Meridian Advisory Group Regional Office

A legitimate-looking consulting office.

Contains:
- Business contracts
- Payment records
- Reception records
- Adrian's professional background

Do not reveal the full criminal organization.

## L10: Rear Service Entrance and Parking Area

The route Paul used to enter and leave.

Contains:
- Access reader
- Service door
- Vehicle observations
- Physical evidence
- Security information

### Location requirements

Each location must include:
- Unique artwork
- Interactive hotspots
- Evidence placements
- Relevant character states
- Unlock conditions
- Return-visit changes
- Notebook integration
- Murder Board integration

---

# 7. EVIDENCE MANIFEST

Implement 30 evidence items.

Every item must have:
- Stable ID
- Name
- Type
- Full inspection text
- Discovery location
- Unlock conditions
- Relevant characters
- Relevant deductions
- Notebook entry
- Asset requirement

## Murder scene evidence

**E01: Initial Police Report**  
The report documents Martin's discovery and the apparent burglary.

**E02: Crime Scene Photographs**  
Shows disturbed furniture, an open drawer, and the position of Martin's body.

**E03: Medical Examiner Summary**  
Establishes a fatal blunt-force injury.

**E04: Missing Desk Ornament**  
A matching empty display area and photographs indicate a heavy brass ornament is missing.

**E05: Disturbed Filing Cabinet**  
Indicates targeted searching rather than indiscriminate theft.

**E06: Rear Service Door Record**  
Shows an after-hours access event.

**E07: Partial Footwear Impression**  
Provides a limited physical comparison, not unique identification.

**E08: Parking Area Witness Statement**  
Describes a contractor's vehicle near the building.

## Martin's investigation

**E09: Martin's Appointment Calendar**  
Shows his planned meeting with Daniel Brooks.

**E10: Martin's Message to Daniel**  
References unexplained financial transfers.

**E11: Hidden Handwritten Ledger**  
Contains Martin's transaction notes and company names.

**E12: Copied Foundation Payment Records**  
Shows suspicious payments to intermediaries.

**E13: Internal Accounting Notes**  
Documents Martin's concerns.

**E14: Martin's Personal Letter**  
Explains his fear of retaliation.

**E15: Foundation Grant Register**  
Shows legitimate and questionable transactions.

## Financial connections

**E16: Meridian Consulting Invoice**  
Shows a payment associated with Meridian Advisory Group.

**E17: Contracting Company Registration**  
Connects a shell contractor to Adrian's business network.

**E18: Adrian Cross Payment Authorization**  
Shows Adrian approved a suspicious transaction.

**E19: Post-Murder Transfer Record**  
Shows a payment to a company associated with Paul after Martin's death.

**E20: Consulting Contract Agreement**  
Provides the legitimate explanation Adrian uses to defend the payments.

## Suspect evidence

**E21: Paul Reddick Work Schedule**  
Conflicts with his stated departure time.

**E22: Building Access Credential Record**  
Shows Paul had access to the building.

**E23: Contractor Vehicle Record**  
Connects Paul's vehicle to the parking area.

**E24: Paul Reddick Financial Statement**  
Shows a suspicious incoming payment.

**E25: Adrian Cross Communication Record**  
Establishes contact with Paul around the relevant period.

**E26: Angela Morris Statement**  
Places Paul near the building.

**E27: Susan Whitfield Statement**  
Confirms Martin raised concerns about accounting irregularities.

**E28: Michael Foster Financial Dispute**  
Provides a plausible but ultimately misleading motive.

## Series evidence

**E29: Meridian Payment Pattern**  
Shows recurring transactions through Meridian-linked businesses.

**E30: Evelyn Voss Referral Note**  
Documents the lead Evelyn voluntarily supplied to Blackwood.

### Important

These entries are the canonical evidence outline.

Before implementation, expand every item into a complete player-visible record.

Do not use the short descriptions above as the only inspection content.

Ensure all evidence is logically discoverable and consistent with the canonical story.

---

# 8. DEDUCTIONS

Implement 12 primary deductions.

## D01: The Burglary Was Targeted

Required:
E02 + E05

Conclusion:
The intruder was searching for specific records.

## D02: Martin Was Investigating Financial Misconduct

Required:
E10 + E13

Conclusion:
Martin was preparing to expose suspicious transactions.

## D03: The Hidden Ledger Was Deliberately Concealed

Required:
E09 + E11

Conclusion:
Martin protected his records before the confrontation.

## D04: The Foundation Payments Were Irregular

Required:
E12 + E15

Conclusion:
Several payments lacked sufficient legitimate justification.

## D05: Meridian Was Connected to the Transactions

Required:
E16 + E29

Conclusion:
Meridian-linked businesses received recurring payments.

## D06: Paul Had After-Hours Access

Required:
E06 + E22

Conclusion:
Paul could enter the building at the relevant time.

## D07: Paul's Alibi Was False

Required:
E21 + E26

Conclusion:
Paul was near the building later than he admitted.

## D08: Paul Was Connected to the Crime Scene

Required:
E07 + E23

Conclusion:
Paul's movements and physical evidence are consistent with his presence.

Do not treat the footwear impression as unique proof.

## D09: Adrian Had a Financial Motive

Required:
E17 + E18

Conclusion:
Adrian had reason to prevent Martin from exposing the transactions.

## D10: Adrian and Paul Were Connected

Required:
E19 + E25

Conclusion:
Adrian and Paul maintained a financial and communication relationship around the murder.

## D11: Paul Murdered Martin

Required:
D01 + D06 + D07 + D08 + E03 + E04

Conclusion:
The combined evidence supports Paul as the murderer.

## D12: Adrian Directed the Theft and Concealed the Crime

Required:
D02 + D09 + D10

Conclusion:
Adrian arranged the attempt to recover Martin's records and subsequently helped conceal Paul's involvement.

### Deduction validation

All deductions must be supported by the evidence.

Do not present assumptions as proven facts.

In particular, distinguish:
- Adrian ordering theft.
- Paul independently committing murder.
- Adrian subsequently concealing the crime.

The final report must preserve these distinctions.

---

# 9. INTERVIEW SYSTEM

Reuse the established Blackwood interview mechanics.

Each character begins with a maximum of 20 questions.

At approximately 15 questions, the character begins indicating that the conversation is ending.

At 20, the interview concludes.

New evidence can unlock five-question follow-up interviews.

Preserve Standard and Hardcore question-credit rules.

### Required interview stages

**Rebecca Keller**
- Initial family interview
- Follow-up after discovering Martin's ledger
- Final case discussion

**Susan Whitfield**
- Initial foundation interview
- Confrontation about ignored warnings
- Follow-up after financial records

**Adrian Cross**
- Initial financial explanation
- Confrontation about suspicious contracts
- Confrontation about Paul
- Final evidence-based interview

**Paul Reddick**
- Initial maintenance interview
- Confrontation about access records
- Confrontation about alibi
- Final murder reconstruction

**Evelyn Voss**
- Initial philanthropic background
- Helpful referral
- Limited follow-up about Meridian

Evelyn must not expose future-series secrets.

### Dialogue requirement

Author complete, character-specific dialogue.

Every response must respect what the character knows at that point.

Avoid generic repeated answers.

Do not allow players to extract the solution simply by asking a broad question such as "Who killed Martin?"

---

# 10. REACTIVE EVENTS

Implement six major reactive events.

## RE01: Rebecca Remembers the Accounting Book

Trigger:
Player establishes Martin was hiding records.

Effect:
Unlocks a clue about the old accounting reference book.

## RE02: Evelyn Provides a Lead

Trigger:
Player identifies suspicious foundation payments.

Effect:
Evelyn contacts Blackwood and directs attention toward a contracting company.

This is a genuine lead.

Do not reveal her hidden motive.

## RE03: Adrian Changes His Story

Trigger:
Player confronts Adrian with payment authorization evidence.

Effect:
Adrian admits some payments were irregular but denies criminal intent.

## RE04: Paul Becomes Defensive

Trigger:
Player establishes Paul's false alibi.

Effect:
Paul becomes less cooperative and may temporarily refuse an interview.

## RE05: Police Recover Additional Financial Records

Trigger:
Player connects Adrian and Paul.

Effect:
Detective Hayes provides an authorized financial evidence update.

## RE06: The Series Investigation Begins

Trigger:
Player completes the murder case and identifies the unresolved Meridian payment network.

Effect:
The wheeled cork board is introduced in Blackwood's office.

The Judas Principle series investigation becomes active.

---

# 11. THE SECOND CORK BOARD

This is a major reusable feature.

## Physical appearance

A large cork board mounted on a wheeled metal frame.

It is positioned inside Blackwood's office near the original wall-mounted Murder Board.

The board should visually match the game's noir aesthetic.

It must be visibly distinct from the original board.

## Introduction

The wheeled board is not present during the initial investigation.

After the player solves S01 C01, a short office sequence introduces it.

The player returns to Blackwood's office.

The new board has been brought into the room.

A notebook entry appears:

**THE JUDAS PRINCIPLE**

*The Keller investigation is closed, but the financial records point beyond Bellwether. Meridian Advisory Group appears repeatedly in transactions that remain unexplained.*

*The murder has been solved. The larger investigation has not.*

The wheeled board becomes available.

## Board behavior

The original wall-mounted board tracks the current case.

The wheeled board tracks the entire Judas Principle series.

Players manually choose which discovered evidence to pin to the wheeled board.

Do not automatically pin evidence.

Do not automatically create red-yarn connections.

Do not automatically solve series deductions.

## Persistence

The wheeled board must preserve:
- Evidence references
- Photographs
- Notes
- Pin positions
- Red-yarn connections
- Player-created labels
- Completed series deductions
- Shared multiplayer state

When S01 C02 begins, the original Murder Board is reset for the new case.

The wheeled board remains exactly as the player left it.

## Evidence handling

Evidence can exist on both boards.

Pinning evidence to the wheeled board must not remove it from the original case.

Use references to canonical evidence IDs.

Do not duplicate the underlying evidence records.

## Series storage

Suggested data structure:

SeriesProgress:
- seriesId
- currentCaseId
- completedCases
- unlockedCases
- seriesBoardState
- seriesEvidenceReferences
- seriesDeductions
- lastPlayedAt

The board belongs to the shared series investigation, not a single case.

---

# 12. SERIES EVIDENCE CARRYOVER

At the end of S01 C01, the following evidence should be eligible for the wheeled board:

- E11: Hidden Handwritten Ledger
- E12: Copied Foundation Payment Records
- E16: Meridian Consulting Invoice
- E17: Contracting Company Registration
- E18: Adrian Cross Payment Authorization
- E19: Post-Murder Transfer Record
- E25: Adrian Cross Communication Record
- E29: Meridian Payment Pattern
- E30: Evelyn Voss Referral Note

These are suggested series-relevant items.

Players may pin any discovered evidence, including items not listed here.

The system must not identify the correct items automatically.

### Future-case compatibility

S01 C02 must be able to reference evidence originally discovered in S01 C01.

For example:

`S001-C01-E016`

This evidence may be connected to new evidence from S01 C02.

The connection must be player-created.

Do not reveal the significance of these cross-case connections in S01 C01.

---

# 13. FINAL ACCUSATION

The player must submit a report identifying:

**Who murdered Martin Keller?**
Paul Reddick.

**What was the murder weapon?**
A heavy brass desk ornament.

**Why did Paul enter the office?**
To steal Martin's financial records.

**Who arranged the theft?**
Adrian Cross.

**Did Adrian explicitly order the murder?**
No.

**Why did Adrian conceal Paul's involvement?**
To protect himself and the fraudulent financial operation.

**What was Martin investigating?**
Suspicious foundation transactions involving intermediary companies and Meridian Advisory Group.

### Outcome

Paul is identified as the murderer.

Adrian's involvement in the theft and cover-up is established.

The local murder investigation is resolved.

The Meridian financial network remains unresolved.

The game must not identify Evelyn as the mastermind.

---

# 14. ENDING SEQUENCE

After submitting the final report, the player returns to Blackwood's office.

The current case is marked complete.

The player receives a final notebook summary.

Suggested ending narration:

"Martin Keller died because he found something he wasn't supposed to see.

His killer has been identified. The man who sent him has been exposed.

But the money didn't begin in Bellwether.

And it didn't end there."

The camera shifts toward the newly delivered wheeled cork board.

A new series investigation becomes available.

**S001: THE JUDAS PRINCIPLE**

The player may begin organizing evidence from The Ledger.

The next case, Room 614, is not automatically started.

The player must explicitly choose to continue.

---

# 15. MULTIPLAYER REQUIREMENTS

Support 1–6 players.

All players share:
- Discovered evidence
- Completed deductions
- Case progression
- Reactive events
- Series board contents
- Board connections
- Case completion

Prevent duplicate event triggers.

Preserve board state when players disconnect.

The introduction of the wheeled board must occur once per shared series session.

Players joining later must see the existing board.

Do not overwrite an established series board with an empty one.

---

# 16. VISUAL STYLE

Bellwether County, Pennsylvania, November 2018.

Use:
- Contemporary painted crime-drama illustrations
- Oil and gouache brushwork
- Subtle film grain
- Cold autumn streets
- Rain-wet pavement
- Brick commercial buildings
- Aging office interiors
- Warm desk lamps
- Muted rust, slate, charcoal, and amber
- Period-accurate 2018 computers, phones, and vehicles

No 1980s styling.

No supernatural elements.

No modern technology beyond the 2018 setting.

Maintain Blackwood's existing visual identity.

---

# 17. IMPLEMENTATION PHASES

## Phase 1: Audit

Inspect the existing Blackwood codebase.

Identify:
- Case data structures
- Evidence system
- Interview system
- Murder Board implementation
- Multiplayer state
- Persistence
- Office scene
- Case selection

## Phase 2: Series architecture

Implement:
- Series identifiers
- Series progression
- Series case numbering
- Cross-case evidence references
- Persistent wheeled board
- Case-to-case progression

## Phase 3: Case data

Implement:
- 10 locations
- 10 characters
- 30 evidence records
- 12 deductions
- 6 reactive events

## Phase 4: Interviews

Author complete character-specific dialogue and evidence-based follow-ups.

## Phase 5: Investigation flow

Implement the full murder investigation, including alternative valid evidence discovery orders.

## Phase 6: Case conclusion

Implement the final accusation, case-closing narrative, and series board introduction.

## Phase 7: Testing

Verify:
- Solo completion
- Multiplayer completion
- Evidence discovery
- Interview question limits
- Re-interviews
- Deduction validation
- Reactive events
- Case completion
- Wheeled board persistence
- Cross-case evidence references
- Resume behavior
- No softlocks

---

# 18. ACCEPTANCE CRITERIA

S01 C01 is complete when:

1. The case is playable from beginning to end.
2. The canonical murder solution is preserved.
3. All 10 locations are implemented.
4. All 10 characters have authored interviews.
5. All 30 evidence items are discoverable.
6. All 12 deductions function.
7. All six reactive events function.
8. The player can correctly identify Paul as the murderer.
9. Adrian's role is distinguished from Paul's.
10. Evelyn remains a believable supporting character.
11. The Meridian connection is established without exposing the wider conspiracy.
12. The second cork board appears after case completion.
13. Players can manually pin discovered evidence to it.
14. The second board preserves evidence positions and yarn connections.
15. The board is tied to series S001.
16. The case uses the player-facing ID S01 C01.
17. The case remains compatible with future S001 cases.
18. Multiplayer synchronization works.
19. Progress persists after leaving and returning.
20. Existing standalone cases remain unchanged.

---

# FINAL INSTRUCTION

Implement S01 C01: The Ledger as the opening chapter of The Judas Principle series.

This must feel like a complete murder mystery with a satisfying resolution, while quietly establishing the foundation for a much larger investigation.

The most important design goals are:

- A believable murder investigation.
- A compelling cast with consistent knowledge.
- Evidence-driven deductions.
- A subtle introduction to Meridian Advisory Group.
- Evelyn Voss appearing genuinely helpful.
- A persistent second cork board that carries evidence across the entire series.
- No automatic cross-case connections.
- A clean transition into S01 C02.

Before writing implementation code, audit the existing project and identify the required changes.

Then create the complete case content and implement it using the existing architecture.

Do not replace existing systems unnecessarily.

Do not reveal future-series spoilers to the player.