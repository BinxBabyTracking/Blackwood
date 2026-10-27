# BLACKWOOD INVESTIGATIONS
# SERIES S001: THE JUDAS PRINCIPLE
# CASE S01 C04: THE INFORMANT

## COMPLETE STORY BIBLE AND IMPLEMENTATION SPECIFICATION

You are implementing the fourth case of Blackwood Investigations' six-case connected series, The Judas Principle.

This is a major narrative turning point. The player begins discovering that Blackwood's previous investigations may have been deliberately manipulated.

Integrate this case with the existing game.

Do not create a standalone application.

Before implementing, inspect:
- S01 C01: The Ledger
- S01 C02: Room 614
- S01 C03: Dead Freight
- Existing office and navigation
- Current Murder Board
- Persistent wheeled series board
- Notebook
- Evidence and deduction systems
- Interview system
- Reactive event system
- Multiplayer synchronization
- Case progression and persistence

Preserve all established mechanics.

Do not reveal the identity of the mastermind.

---

# 1. CASE INFORMATION

Series ID: S001
Series title: The Judas Principle
Internal case ID: S001-C04
Player-facing ID: S01 C04
Case title: The Informant
Location: Northern Virginia, primarily Alexandria and Arlington
Date: December 12–14, 2018
Target duration: 150–180 minutes
Players: 1–6
Difficulty: Advanced
Genre: Missing-person mystery, psychological thriller, conspiracy investigation

Case structure: Four acts
Primary locations: 13
Interviewable characters: 12
Evidence items: 42
Primary case deductions: 17
Reactive events: 9
New series deductions: 3

## Case premise

Claire Donovan, a 34-year-old former Meridian Advisory Group records analyst, contacts Blackwood Investigations.

She claims to possess evidence showing that the crimes investigated in Pennsylvania, Washington, D.C., and Baltimore were connected.

More importantly, she claims someone has been deliberately directing Blackwood toward certain people within Meridian.

Claire requests a private meeting in Alexandria, Virginia.

She never arrives.

Her apartment has been searched.

Her phone has been disconnected.

A handwritten message is found in the location where she planned to meet Blackwood:

"You're looking at the wrong people."

The player must determine whether Claire fled, was kidnapped, or deliberately misled the investigators.

As the case develops, Blackwood discovers that Claire initially participated in a controlled disappearance, believing she was helping expose corrupt Meridian executives.

But when she tried to withdraw, she was abducted by the same organization she was attempting to expose.

The player must recover Claire alive, identify those responsible, and determine who arranged the earlier information leaks.

By the end, Blackwood discovers that some of its most important leads were genuine but deliberately selected.

The mastermind remains unidentified.

---

# 2. SERIES CONTINUITY

The following cases have been completed:

S01 C01: The Ledger
S01 C02: Room 614
S01 C03: Dead Freight

The player has potentially discovered:

- Adrian Cross's fraudulent financial activities.
- Marcus Shaw's surveillance and blackmail operation.
- Victor Kane's freight and enforcement network.
- Meridian's connections across these operations.
- A communication referencing an unidentified superior as "A."
- An internal reference to someone called "The Architect."

These discoveries must remain consistent.

## Starting state

When S01 C04 begins:

1. The original Murder Board is reset for the new investigation.
2. The wheeled series board remains exactly as the player left it.
3. Previously pinned evidence remains pinned.
4. All red-yarn connections remain unchanged.
5. All player-created notes and labels persist.
6. Completed series deductions remain saved.
7. The new case briefing appears in the office.
8. Archived evidence from earlier cases remains accessible.
9. No evidence is automatically pinned or connected.

Do not assume optional evidence was collected.

Do not overwrite or reconstruct the player's series board.

---

# 3. CANONICAL TRUTH

AUTHOR-ONLY INFORMATION.

Do not expose this information directly to the player.

## Claire Donovan

Claire worked for Meridian Advisory Group for six years.

Her official responsibilities involved records management, internal compliance documentation, and corporate account reconciliation.

She was not a senior criminal operator.

However, her role gave her access to documents concerning multiple Meridian divisions.

Over time, Claire noticed irregularities involving:
- Financial transfers.
- Confidential client dossiers.
- Security contractors.
- Unusual record-retention instructions.
- Documents disappearing from internal archives.

She initially believed the irregularities were isolated misconduct by senior employees.

She eventually concluded that the activities were connected.

## Evelyn Voss's manipulation

Evelyn Voss recognized that Adrian Cross, Marcus Shaw, and Victor Kane had become liabilities.

Their operations were attracting attention and generating unnecessary risk.

Evelyn wanted their activities exposed without revealing her own authority.

She approached Claire through a trusted philanthropic intermediary.

Evelyn presented herself as someone concerned about misconduct within Meridian and its affiliated organizations.

She convinced Claire that selectively releasing genuine evidence would help expose corrupt executives.

Claire did not know Evelyn was directing the broader criminal network.

Claire believed Evelyn was a legitimate ally.

## The information leaks

Claire supplied selected documents through intermediaries.

These records helped create investigative leads in the previous cases.

The information was genuine.

However, it was deliberately incomplete.

It identified Adrian, Marcus, and Victor while omitting documents that could expose the organization's highest leadership.

Evelyn controlled which records Claire was encouraged to disclose.

Claire did not initially understand that she was helping Evelyn remove disloyal associates.

## Claire's decision to contact Blackwood

After the events of Dead Freight, Claire noticed a pattern.

The people being exposed were precisely those whose activities had recently drawn internal criticism.

She realized the leaks were not simply exposing wrongdoing.

They were selectively targeting individuals.

Claire contacted Blackwood directly.

She intended to disclose how the documents had reached the agency.

She also planned to provide evidence of internal instructions controlling the leaks.

## The staged disappearance

Evelyn learned Claire intended to meet Blackwood.

Through an intermediary, Evelyn convinced Claire that Meridian security personnel were monitoring her.

The intermediary proposed a temporary disappearance to protect Claire while additional records were secured.

Claire reluctantly agreed.

She left her apartment and traveled to a designated safe location.

She believed she was participating in a protective operation.

## The real kidnapping

Marcus Shaw's remaining intelligence network discovered Claire's movements.

Marcus believed Claire possessed records that could expose him and other Meridian personnel.

Marcus instructed his subordinate, Nathan Cole, to recover Claire and her documents.

Nathan intercepted Claire at the supposed safe location.

When Claire realized she was being detained, she attempted to leave.

Nathan restrained her and transported her to a second property.

Claire was held against her will.

Marcus wanted to recover her records and determine what she had already told Blackwood.

## Important distinction

Evelyn orchestrated the initial controlled disappearance.

Marcus independently ordered Claire's subsequent detention after learning of her activities.

Evelyn did not need to order the kidnapping for her manipulation to matter.

This distinction must remain consistent throughout the series.

## Claire's evidence

Before disappearing, Claire created an encrypted archive containing:
- Internal Meridian communications.
- Selected document-transfer records.
- Evidence of controlled information leaks.
- References to Adrian, Marcus, and Victor.
- Partial communications from an unidentified superior.
- Records showing that Blackwood received selectively chosen leads.

The archive does not directly identify Evelyn as the mastermind.

Claire retained a separate record of her contact with Evelyn through a philanthropic intermediary.

That record is incomplete and initially appears innocuous.

## The central revelation

Blackwood discovers that several previous leads were deliberately planted.

The evidence was real.

The conclusions about individual crimes were correct.

But the agency had been directed toward specific targets.

Someone has been using Blackwood to dismantle selected parts of Meridian.

The player must not yet know who.

---

# 4. PRIMARY MISSING PERSON

## CH01: Claire Donovan

Age: 34
Occupation: Former Meridian records analyst
Residence: Alexandria, Virginia
Status: Missing at opening, rescued alive

### Personality

Intelligent, careful, observant, and increasingly distrustful.

Claire is not a professional criminal.

She is frightened by the consequences of her decisions.

### What she knows

- Meridian maintained records linking multiple operations.
- Some information was deliberately withheld from Blackwood.
- Selected evidence was released to expose specific executives.
- A philanthropic contact encouraged her cooperation.
- Marcus's network became involved in her disappearance.
- Nathan Cole detained her.

### What she does not know

- Evelyn is the Architect.
- The complete criminal hierarchy.
- The full extent of Evelyn's control.
- The events of the final two cases.

### Interview availability

Claire is unavailable during the first three acts.

She becomes interviewable after her rescue.

Her testimony is essential to resolving the case.

---

# 5. INTERVIEWABLE CHARACTERS

Implement 12 interviewable characters, including Claire.

Every character requires:
- Stable ID
- Portrait
- Biography
- Personality
- Knowledge boundaries
- Initial interview
- Evidence-dependent responses
- Contradictions
- Re-interview conditions
- Availability states
- Final case state

## CH02: Nathan Cole

Age: 37
Occupation: Private security contractor
Role: Direct kidnapper

Nathan detained Claire after she attempted to leave the supposed safe location.

He transported her to a second property.

He claims she voluntarily requested protection.

He is lying about her ability to leave.

## CH03: Marcus Shaw

Age: 46
Occupation: Meridian intelligence director
Role: Organizer of Claire's kidnapping

Marcus previously appeared in Room 614.

His current legal status must reflect that case's outcome.

If he is detained or under investigation, establish a plausible method by which he continued directing subordinates, such as a documented communication through an intermediary.

Do not casually portray him as unrestricted if earlier events established otherwise.

Marcus wants Claire's records recovered.

He does not reveal Evelyn's identity.

## CH04: Evelyn Voss

Age: 52
Occupation: Philanthropist
Role: Hidden mastermind

Evelyn previously appeared in The Ledger.

She appears only briefly in this case.

She expresses concern about Claire's disappearance.

She acknowledges that she supports organizations promoting corporate accountability.

She does not admit directing the leaks.

She does not identify herself as the Architect.

Her statements must be carefully authored so later revelations remain consistent.

## CH05: Laura Bennett

Age: 42
Occupation: Nonprofit program director
Role: Evelyn's intermediary

Laura works with a philanthropic organization associated with Evelyn.

She believed she was helping a whistleblower.

She conveyed messages to Claire.

She did not know the full criminal purpose.

She is not involved in the kidnapping.

## CH06: Daniel Price

Age: 36
Occupation: Software engineer
Role: Claire's former partner

Daniel knows Claire was afraid of Meridian.

He helped her secure personal files.

He initially conceals their recent contact because he fears being implicated.

He is innocent.

## CH07: Rachel Foster

Age: 33
Occupation: Claire's neighbor

Rachel noticed unfamiliar visitors near Claire's apartment.

She saw Claire leave with a small travel bag.

She did not witness the later kidnapping.

She is innocent.

## CH08: Thomas Reed

Age: 51
Occupation: Former Meridian compliance officer

Thomas worked with Claire.

He knows Meridian maintained unusual document classifications.

He fears retaliation.

He can explain internal records management.

He does not know the mastermind's identity.

## CH09: Olivia Marsh

Age: 29
Occupation: Café manager

Olivia manages the café where Claire planned to meet Blackwood.

She discovered the handwritten message.

She noticed someone waiting near the café before Claire's scheduled arrival.

She is innocent.

## CH10: Detective Sarah Collins

Age: 42
Occupation: Metropolitan Police Department detective

Sarah previously appeared in Room 614.

She is now assisting with a related investigation.

Her involvement must be jurisdictionally plausible.

Coordinate with local Virginia authorities for actions occurring outside Washington, D.C.

She is not corrupt.

## CH11: Detective Michael Harris

Age: 45
Occupation: Alexandria Police Department detective

Michael handles Claire's disappearance locally.

He initially considers voluntary disappearance possible.

He later coordinates the recovery operation.

He is not corrupt.

## CH12: Peter Lang

Age: 44
Occupation: Corporate records contractor

Peter previously worked on Meridian document storage systems.

He can explain archive access logs and document transfers.

He is not involved in Claire's kidnapping.

He is initially reluctant to cooperate.

---

# 6. LOCATIONS

Implement 13 primary locations.

## L01: Blackwood Office

Existing office hub.

Contains:
- Case briefing
- Notebook
- Current Murder Board
- Persistent wheeled series board
- Telephone
- Travel access

## L02: Alexandria Café

Claire's planned meeting location.

Contains:
- Reserved table
- Handwritten message
- Staff observations
- Exterior camera coverage

## L03: Claire Donovan's Apartment

Contains:
- Personal correspondence
- Signs of a search
- Computer
- Financial records
- Hidden document references

## L04: Claire's Apartment Building

Contains:
- Entry records
- Hallway observations
- Neighbor interviews
- Visitor information

## L05: Meridian Records Office

Contains:
- Archive access records
- Document classification system
- Internal communications
- Former employee information

## L06: Thomas Reed's Residence

Contains:
- Background information
- Old Meridian documentation
- Internal records procedures

## L07: Laura Bennett's Nonprofit Office

Contains:
- Philanthropic correspondence
- Claire's initial contact records
- Meeting schedules
- Intermediary communications

## L08: Daniel Price's Apartment

Contains:
- Claire's recent communications
- Personal files
- Evidence of her preparation to disclose information

## L09: Corporate Document Storage Facility

Contains:
- Archived records
- Access logs
- Document-transfer evidence
- Encrypted archive references

## L10: Initial Safe Location

A rented suburban property where Claire believed she would be protected.

Contains:
- Evidence of her voluntary arrival
- Travel records
- Signs of later confrontation
- Nathan's presence

## L11: Nathan Cole's Security Office

Contains:
- Vehicle records
- Contractor schedules
- Communication records
- Property information

## L12: Second Holding Property

Initially locked.

Contains:
- Claire's confinement location
- Physical evidence
- Communication devices
- Rescue sequence

## L13: Alexandria Police Department

Contains:
- Police reports
- Forensic updates
- Detective Harris
- Authorized evidence access

### Location requirements

Each location must include:
- Original artwork
- Interactive hotspots
- Evidence placements
- Unlock conditions
- Relevant character states
- Return-visit changes
- Notebook integration
- Murder Board integration

Avoid rigidly linear location progression.

---

# 7. EVIDENCE MANIFEST

Implement exactly 42 canonical evidence items.

Use globally unique IDs.

Example:
S001-C04-E001

Every item requires:
- Full player-visible content
- Provenance
- Discovery location
- Unlock conditions
- Related characters
- Related deductions
- Notebook entry
- Asset requirement
- Critical or supporting classification

## Group A: Initial Disappearance

E001: Claire's Initial Message
Her request to meet Blackwood.

E002: Café Meeting Reservation
Confirms the planned meeting.

E003: Handwritten Warning
Contains the message "You're looking at the wrong people."

E004: Café Surveillance Record
Shows relevant visitors.

E005: Claire's Apartment Photographs
Documents the apartment's condition.

E006: Apartment Entry Record
Shows unusual access activity.

E007: Neighbor Witness Statement
Describes Claire leaving with a travel bag.

E008: Claire's Personal Phone Record
Shows interrupted communications.

## Group B: Claire's Preparation

E009: Meridian Employment Record
Confirms Claire's role.

E010: Claire's Resignation Letter
Explains her departure.

E011: Personal Document Inventory
Lists records Claire collected.

E012: Encrypted Archive Reference
Points toward her backup records.

E013: Daniel Price Communication
Shows Claire anticipated danger.

E014: Thomas Reed Statement
Explains Meridian's records system.

E015: Document Classification Guide
Shows unusual internal categories.

E016: Archive Access Log
Shows records Claire accessed.

## Group C: Controlled Information Leaks

E017: Document Transfer Record
Shows selected records leaving Meridian's archive.

E018: Anonymous Submission Metadata
Connects earlier tips to a common intermediary.

E019: Selected Financial Records
References Adrian Cross's activities.

E020: Selected Intelligence Records
References Marcus Shaw's operation.

E021: Selected Freight Records
References Victor Kane's operation.

E022: Missing Document Sequence
Shows gaps in the material provided.

E023: Internal Review Memorandum
Documents concerns about certain Meridian executives.

E024: Philanthropic Contact Record
Shows Claire communicated through Laura Bennett.

E025: Laura Bennett Communication
Shows Claire received instructions about what to disclose.

E026: Claire's Private Notes
Expresses concern that the disclosures were selective.

## Group D: The Kidnapping

E027: Initial Safe Location Booking
Shows Claire agreed to travel there.

E028: Safe Location Entry Record
Confirms her voluntary arrival.

E029: Evidence of Confrontation
Shows a later struggle.

E030: Nathan Cole Vehicle Record
Connects Nathan to the property.

E031: Nathan Cole Communication Record
Shows contact with Marcus's operation.

E032: Marcus Shaw Instruction
Directs recovery of Claire and her records.

E033: Second Property Lease
Links Nathan to the holding location.

E034: Second Property Access Record
Shows activity during Claire's detention.

E035: Confinement Evidence
Establishes that Claire was held involuntarily.

E036: Claire's Rescue Statement
Describes her detention.

## Group E: Series Revelations

E037: Recovered Meridian Archive
Contains selected records across multiple operations.

E038: Cross-Case Submission Pattern
Shows that several earlier leads followed a common disclosure process.

E039: Executive Exposure Timeline
Shows which Meridian executives were targeted and when.

E040: Unidentified Authorization Record
Shows the disclosure process was directed by someone above the exposed executives.

E041: Partial "A" Communication
Contains an incomplete reference to the same unidentified authority from earlier cases.

E042: Claire's Philanthropic Contact Summary
Documents Claire's relationship with an apparently legitimate philanthropic intermediary.

### Evidence restrictions

E040 and E041 must not identify Evelyn.

E042 must not prove Evelyn's control.

The evidence should support suspicion that someone manipulated the investigation without identifying who.

The player must be able to revisit these records in S01 C05 and S01 C06.

### Authoring requirements

Expand all 42 items into complete player-visible evidence.

Do not use the short manifest descriptions as finished content.

Do not reveal future case information.

Do not invent evidence that contradicts previous cases.

---

# 8. PRIMARY CASE DEDUCTIONS

Implement 17 deductions.

## D01: Claire Intended to Meet Blackwood

Required:
E001 + E002

Conclusion:
Claire arranged a genuine meeting.

## D02: Claire Prepared for Disclosure

Required:
E011 + E013

Conclusion:
Claire was preparing to release information.

## D03: Claire Left Her Apartment Voluntarily

Required:
E007 + E027

Conclusion:
Claire initially left voluntarily.

## D04: The Apartment Was Searched

Required:
E005 + E006

Conclusion:
Someone accessed or searched the apartment.

## D05: Claire Accessed Sensitive Meridian Records

Required:
E009 + E016

Conclusion:
Claire had access to records concerning Meridian's operations.

## D06: The Earlier Disclosures Were Selective

Required:
E017 + E022

Conclusion:
Only certain records were released.

## D07: The Disclosures Targeted Specific Executives

Required:
E019 + E020 + E021

Conclusion:
The released documents focused on Adrian, Marcus, and Victor.

## D08: A Common Channel Distributed the Leads

Required:
E018 + E038

Conclusion:
Multiple earlier leads passed through a common disclosure process.

## D09: Claire Received External Guidance

Required:
E024 + E025

Conclusion:
Claire was receiving instructions about disclosure.

## D10: Claire Initially Agreed to Hide

Required:
E027 + E028

Conclusion:
Claire voluntarily entered the first safe location.

## D11: The Safe Location Became Dangerous

Required:
E029 + E030

Conclusion:
Nathan was present when Claire's voluntary arrangement broke down.

## D12: Nathan Transported Claire

Required:
E030 + E033 + E034

Conclusion:
Nathan was connected to Claire's transfer to the second property.

## D13: Claire Was Kidnapped

Required:
D10 + D11 + D12 + E035

Conclusion:
Claire's initial voluntary disappearance became an involuntary detention.

## D14: Marcus Directed the Detention

Required:
E031 + E032

Conclusion:
Marcus's operation directed Nathan to recover Claire and her records.

## D15: Claire's Records Were Deliberately Filtered

Required:
E022 + E026 + E037

Conclusion:
The records released to Blackwood were genuine but incomplete.

## D16: Blackwood Was Being Directed Toward Specific Targets

Required:
D06 + D07 + D08 + D15

Conclusion:
The earlier investigations were influenced by a deliberate information-release strategy.

## D17: An Unidentified Authority Controlled the Disclosures

Required:
E039 + E040 + E041

Conclusion:
Someone above the exposed executives was involved in controlling the information flow.

### Deduction restrictions

Do not reveal Evelyn's identity.

Do not equate Claire's participation in the initial disappearance with consent to later detention.

Do not make Marcus responsible for Evelyn's separate manipulation unless supported by evidence.

Do not require optional series deductions to solve this case.

---

# 9. FOUR-ACT STRUCTURE

## ACT 1: THE MISSED MEETING

Target duration: 30–40 minutes.

Available:
- Blackwood office
- Café
- Claire's apartment
- Apartment building
- Police contact

Objectives:
1. Investigate the missed meeting.
2. Examine Claire's apartment.
3. Interview witnesses.
4. Establish Claire's recent activities.
5. Determine whether she left voluntarily.

Act conclusion:
Claire appears to have planned part of her disappearance.

## ACT 2: THE SELECTED TRUTH

Target duration: 40–45 minutes.

New locations:
- Meridian records office
- Thomas Reed's residence
- Laura Bennett's office
- Corporate document storage

Objectives:
1. Investigate Claire's former employment.
2. Recover document-transfer records.
3. Compare earlier Meridian disclosures.
4. Identify selective evidence releases.
5. Discover Claire's philanthropic contact.

Act conclusion:
Someone was deliberately choosing which Meridian executives to expose.

## ACT 3: THE FALSE SAFE HOUSE

Target duration: 35–45 minutes.

New locations:
- Daniel Price's apartment
- Initial safe location
- Nathan's office

Objectives:
1. Reconstruct Claire's voluntary disappearance.
2. Identify Nathan's involvement.
3. Establish the later kidnapping.
4. Trace Claire's transfer.
5. Identify Marcus's direction.

Act conclusion:
Claire is being held at a second property.

## ACT 4: SOMEONE ELSE'S INVESTIGATION

Target duration: 40–50 minutes.

New location:
- Second holding property

Objectives:
1. Coordinate Claire's recovery.
2. Examine confinement evidence.
3. Interview Claire.
4. Recover her archive.
5. Reconstruct the controlled leaks.
6. Establish that Blackwood was manipulated.
7. Submit the final report.

Act conclusion:
Claire is rescued, and the player discovers that the previous investigations were deliberately influenced.

---

# 10. REACTIVE EVENTS

Implement nine authored events.

## RE01: The Warning Appears

Trigger:
Player investigates the café.

Effect:
The handwritten warning becomes available.

## RE02: Claire's Apartment Is Revisited

Trigger:
Player discovers inconsistencies in the apartment entry record.

Effect:
Additional evidence of a search becomes discoverable.

## RE03: Thomas Reed Becomes Nervous

Trigger:
Player identifies sensitive Meridian records.

Effect:
Thomas initially withdraws from questioning.

New evidence unlocks a follow-up.

## RE04: Laura Bennett Provides Correspondence

Trigger:
Player establishes Claire's philanthropic contact.

Effect:
Laura supplies relevant communications.

## RE05: A Familiar Document Pattern

Trigger:
Player compares the earlier disclosures.

Effect:
The common submission pattern becomes discoverable.

## RE06: Nathan Changes His Story

Trigger:
Player establishes Claire's presence at the initial safe location.

Effect:
Nathan claims Claire requested protective relocation.

## RE07: Claire Is Moved

Trigger:
Player establishes Nathan's involvement.

Effect:
The investigation reveals that Claire was transferred to a second property.

Do not use an unavoidable countdown.

Do not permanently remove Claire from the investigation.

## RE08: Claire Is Rescued

Trigger:
Player identifies the second property and coordinates police intervention.

Effect:
Claire becomes interviewable.

## RE09: The Manipulation Revelation

Trigger:
Player completes D16 and D17.

Effect:
A major series notebook entry becomes available.

Do not automatically pin evidence to the wheeled board.

---

# 11. RESCUE SEQUENCE

Claire must survive.

The rescue should emphasize investigation and evidence, not combat.

The player identifies the holding property and coordinates with law enforcement.

For solo play:
- Every required action must be achievable by one player.
- No teammate-dependent puzzles.
- No unavoidable failure.

For multiplayer:
- Players may investigate different areas.
- Shared discoveries synchronize.
- The rescue occurs once.
- All players receive the same canonical outcome.

Do not introduce mandatory combat.

---

# 12. INTERVIEW SYSTEM

Reuse Blackwood's established interview mechanics.

Initial limit: 20 questions per character.

At approximately 15 questions, characters begin indicating the interview is ending.

At 20 questions, the interview concludes.

New evidence can unlock five-question follow-ups.

Preserve Standard and Hardcore interview-credit rules.

## Important interview progression

Claire:
- Initially unavailable.
- Rescued in Act 4.
- Explains her records role.
- Admits participating in selective disclosures.
- Describes the staged disappearance.
- Describes the kidnapping.
- Explains why she suspects manipulation.
- Does not know Evelyn's true identity.

Nathan:
- Initially denies involvement.
- Claims Claire voluntarily requested protection.
- Is contradicted by confinement evidence.
- Is implicated in the kidnapping.

Marcus:
- Current legal status reflects Room 614.
- His involvement is established through communications and subordinates.
- Does not reveal the mastermind.

Laura:
- Believes she helped protect a whistleblower.
- Admits relaying instructions.
- Does not know Evelyn's criminal role.

Evelyn:
- Appears credible and concerned.
- Provides limited, carefully worded information.
- Does not expose herself.
- Does not behave like an obvious villain.

All interviews must be authored around character-specific knowledge boundaries.

---

# 13. PERSISTENT SERIES BOARD

The wheeled cork board must remain exactly as the player left it after S01 C03.

Players may manually pin evidence from The Informant.

Suggested series-relevant items:

E017: Document Transfer Record
E018: Anonymous Submission Metadata
E022: Missing Document Sequence
E024: Philanthropic Contact Record
E025: Laura Bennett Communication
E026: Claire's Private Notes
E037: Recovered Meridian Archive
E038: Cross-Case Submission Pattern
E039: Executive Exposure Timeline
E040: Unidentified Authorization Record
E041: Partial "A" Communication
E042: Claire's Philanthropic Contact Summary

These are suggestions only.

Do not automatically pin them.

## New series deduction S001-D004

Title: The Previous Leads Shared a Common Source

Required evidence:
S001-C01-E030
S001-C04-E018
S001-C04-E038

Conclusion:
Information influencing earlier investigations was distributed through a coordinated disclosure process.

## New series deduction S001-D005

Title: The Evidence Was Deliberately Selected

Required evidence:
S001-C04-E017
S001-C04-E022
S001-C04-E039

Conclusion:
The information released to Blackwood was chosen to expose specific Meridian executives.

## New series deduction S001-D006

Title: Someone Is Using Blackwood

Required:
S001-D004
S001-D005
S001-C04-E040

Conclusion:
An unidentified authority has been using genuine evidence to guide Blackwood toward selected targets.

### Series deduction rules

These deductions belong to S001.

They are optional for completing S01 C04.

They require manual player-created evidence connections.

They persist into S01 C05 and S01 C06.

Do not automatically solve them.

Do not reveal Evelyn's identity.

---

# 14. FINAL CASE REPORT

The player must answer:

Who contacted Blackwood?
Claire Donovan.

Why did Claire contact Blackwood?
To expose the selective release of Meridian records and the manipulation of previous investigations.

Did Claire initially leave voluntarily?
Yes.

Why did she initially disappear?
She believed she was participating in a protective arrangement.

Was she later kidnapped?
Yes.

Who physically detained Claire?
Nathan Cole.

Who directed the detention?
Marcus Shaw.

Why was Claire detained?
To recover records and determine what she had disclosed.

What was Claire's role in the earlier leaks?
She supplied genuine but selectively chosen information through intermediaries.

Were the earlier case conclusions false?
No.

Were the earlier investigations manipulated?
Yes.

Who controlled the selection of information?
An unidentified authority operating through intermediaries.

Is the Architect's identity established?
No.

### Completion requirements

Require evidence-supported answers.

Allow incorrect reports to be revised.

Do not require optional series deductions.

Do not identify Evelyn Voss.

---

# 15. ENDING SEQUENCE

After Claire's rescue and the final report, the player returns to Blackwood's office.

The original Murder Board contains the completed disappearance investigation.

The wheeled board remains available.

A new series notebook entry appears:

THE JUDAS PRINCIPLE

"We thought we were following the evidence.

The evidence was real.

The crimes were real.

But someone chose which truths we would see.

Someone wanted Adrian Cross exposed.

Someone wanted Marcus Shaw exposed.

Someone wanted Victor Kane exposed.

And we helped them.

The question is no longer just who runs Meridian.

It's why they wanted us to find everyone else."

Do not reveal Evelyn.

Mark S01 C04 complete.

Unlock S01 C05: The Benefactor.

Do not automatically begin the next case.

---

# 16. MULTIPLAYER REQUIREMENTS

Support 1–6 players.

Synchronize:
- Evidence discoveries
- Deduction completion
- Interview availability
- Reactive events
- Rescue state
- Case progression
- Series board state
- Player-created yarn connections
- Series deductions

Prevent duplicate event triggers.

Preserve progress when players disconnect.

Do not overwrite an existing series board.

---

# 17. VISUAL DIRECTION

Northern Virginia, December 2018.

Use:
- Contemporary painted crime-drama illustrations
- Gouache and oil textures
- Visible brushwork
- Subtle film grain
- Cold winter streets
- Wet pavement
- Suburban townhouses
- Corporate records offices
- Quiet cafés
- Dim apartment interiors
- Restrained charcoal, slate, amber, and rust palette
- Realistic 2018 phones, computers, and vehicles

No 1980s styling.

No supernatural elements.

No futuristic technology.

Keep locations geographically plausible.

---

# 18. IMPLEMENTATION ORDER

Phase 1: Audit existing series infrastructure.

Phase 2: Verify prior case continuity and series board persistence.

Phase 3: Implement The Informant case record and four-act structure.

Phase 4: Author all 42 evidence items.

Phase 5: Implement 17 primary deductions.

Phase 6: Build 13 locations.

Phase 7: Implement 12 interviewable characters.

Phase 8: Implement nine reactive events.

Phase 9: Implement the staged-disappearance reconstruction.

Phase 10: Implement Claire's rescue and final interview.

Phase 11: Implement the three new series deductions.

Phase 12: Implement the final report and ending.

Phase 13: Test solo, multiplayer, persistence, and alternative investigation orders.

---

# 19. ACCEPTANCE CRITERIA

The Informant is complete when:

1. S01 C04 appears under S001: The Judas Principle.
2. All prior series board content persists.
3. The original Murder Board is prepared for the new case.
4. The new case briefing is available.
5. All 13 locations are implemented.
6. All 12 characters have complete interviews.
7. All 42 evidence items are discoverable.
8. All 17 deductions function.
9. All nine reactive events function.
10. Claire's initial voluntary disappearance can be established.
11. The later kidnapping can be proven.
12. Nathan is identified as the direct kidnapper.
13. Marcus's direction is established.
14. Claire is rescued alive.
15. The controlled information leaks are uncovered.
16. The player can establish that Blackwood was manipulated.
17. The earlier investigations remain factually valid.
18. Evelyn's identity remains concealed.
19. Three new series deductions function.
20. Previous series deductions remain saved.
21. No evidence is automatically pinned or connected.
22. Multiplayer progression synchronizes correctly.
23. No critical softlocks exist.
24. No purchased interview questions are required.
25. Existing cases remain functional.
26. S01 C05 unlocks after successful completion.

---

# FINAL INSTRUCTION

Implement S01 C04: The Informant as the fourth case of The Judas Principle.

This case must fundamentally change how players interpret the first three investigations.

The player should discover that Blackwood has been receiving genuine evidence selected by an unidentified authority.

The earlier crimes were real, and the identified perpetrators remain responsible.

But someone has been exploiting Blackwood's investigations to expose particular members of Meridian.

Claire Donovan must survive.

Evelyn Voss must remain a credible, apparently helpful philanthropic figure.

Do not reveal her as the Architect.

Preserve the original Murder Board, persistent wheeled series board, cross-case evidence references, player-created connections, and multiplayer state.

Audit the existing implementation first, then implement the case using established Blackwood systems.