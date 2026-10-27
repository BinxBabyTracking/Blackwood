# BLACKWOOD INVESTIGATIONS
# SERIES S001: THE JUDAS PRINCIPLE
# CASE S01 C02: ROOM 614

## COMPLETE CANONICAL STORY AND IMPLEMENTATION BRIEF

You are implementing the second case in Blackwood Investigations' connected six-case series, The Judas Principle.

This is an extension of the existing game, not a standalone application.

Before implementing anything, inspect the existing codebase, particularly S01 C01: The Ledger, the series progression system, the office, the two Murder Boards, evidence persistence, interviews, notebook, multiplayer, and reactive events.

Preserve all previously implemented functionality.

Do not rewrite working systems unnecessarily.

Do not reveal the identity of the series mastermind.

---

# 1. CASE INFORMATION

Series ID: S001
Series title: The Judas Principle
Internal case ID: S001-C02
Player-facing ID: S01 C02
Case title: Room 614
Location: Washington, D.C.
Date: November 19–21, 2018
Target duration: 150 minutes
Players: 1–6
Difficulty: Intermediate to Advanced
Genre: Missing-person investigation, corporate espionage, blackmail, kidnapping

Case structure: Four acts
Primary locations: 12
Interviewable characters: 11
Evidence items: 36
Primary deductions: 15
Reactive events: 8

## Case premise

Jonathan Price, a 41-year-old government procurement contractor, disappears from Room 614 of the fictional Ashcroft Hotel in Washington, D.C.

Jonathan was scheduled to provide testimony concerning procurement irregularities the following morning.

His luggage remains in the room.

His personal phone is found on the bedside table.

There is no obvious evidence of forced entry.

Hotel surveillance appears to show that Jonathan never left through the main entrances.

The police initially consider voluntary disappearance, but his sister, Natalie Price, believes he has been abducted.

She hires Blackwood Investigations.

The player must determine how Jonathan disappeared, who arranged it, where he is being held, and why.

The investigation exposes a covert intelligence operation associated with Meridian Advisory Group.

By the end, Jonathan is recovered alive, the kidnapping is solved, and the player discovers the first documented reference to a superior known only as "A."

---

# 2. SERIES CONTINUITY

S01 C01: The Ledger has already occurred.

The player previously investigated the murder of Martin Keller in Pennsylvania.

That investigation exposed suspicious financial transactions involving Meridian Advisory Group and Adrian Cross.

The player may have pinned relevant evidence to the wheeled series board.

## Required starting state

At the beginning of Room 614:

1. The original wall-mounted Murder Board is cleared for the new investigation.
2. The wheeled series board remains exactly as the player left it.
3. All pinned documents, photographs, notes, positions, and yarn connections remain intact.
4. Previously completed series deductions remain saved.
5. The office desk contains the new Room 614 briefing.
6. Previously discovered evidence from The Ledger remains accessible through the archived case file.
7. Nothing is automatically pinned or connected on the series board.

Do not duplicate previously discovered evidence records.

Do not silently add evidence from The Ledger that the player never discovered.

## Cross-case evidence

The following earlier evidence may become relevant:

S001-C01-E011: Hidden Handwritten Ledger
S001-C01-E012: Copied Foundation Payment Records
S001-C01-E016: Meridian Consulting Invoice
S001-C01-E017: Contracting Company Registration
S001-C01-E019: Post-Murder Transfer Record
S001-C01-E029: Meridian Payment Pattern
S001-C01-E030: Evelyn Voss Referral Note

These are references to existing records, not newly created evidence.

The player decides whether to use them on the wheeled board.

---

# 3. CANONICAL TRUTH

AUTHOR-ONLY INFORMATION.

Do not expose the following solution through player-visible metadata, character biographies, case selection, or opening narration.

## Jonathan Price's involvement

Jonathan Price worked as a senior procurement analyst for the fictional defense contracting company Eastbridge Systems.

His work involved reviewing government procurement proposals and vendor relationships.

Approximately eighteen months before the case begins, Jonathan developed substantial personal debts.

Marcus Shaw, director of a private intelligence operation operating through Meridian Advisory Group, learned about Jonathan's financial vulnerability.

Marcus arranged for Jonathan to receive financial assistance through an intermediary.

The assistance was not charitable.

In exchange, Jonathan began supplying confidential procurement information.

Initially, he provided relatively minor internal documents.

Over time, Marcus demanded increasingly sensitive material.

Jonathan eventually realized the information was being used to influence contract awards, pressure executives, and compromise government contractors.

He decided to stop cooperating.

## Jonathan's planned testimony

Jonathan had been contacted by federal investigators examining procurement irregularities.

He agreed to provide information concerning improper vendor influence and suspicious contracting activity.

He did not initially disclose his own full involvement.

Marcus learned that Jonathan was preparing to cooperate.

Marcus feared that Jonathan could identify members of Meridian's intelligence network.

## The kidnapping plan

Marcus instructed his operations coordinator, Owen Mercer, to recover Jonathan and the documents he possessed.

Owen recruited Daniel Hurst, a hotel maintenance employee who had accumulated gambling debts.

Owen promised Daniel money in exchange for helping move Jonathan through a restricted hotel service corridor.

Daniel provided a temporary access credential and disabled a service-door alarm under the pretense of scheduled maintenance.

Owen entered Room 614 shortly after 10:30 PM on November 18.

Jonathan knew Owen from previous meetings and initially opened the door voluntarily.

Owen threatened Jonathan and forced him to surrender his laptop.

When Jonathan refused to reveal where he had stored copies of the records, Owen restrained him.

Daniel helped Owen move Jonathan through a staff-only service route.

They exited through a loading entrance outside the coverage of the hotel's primary guest-facing cameras.

Jonathan was transported to a private residence in rural Maryland.

## The holding location

Jonathan was confined in a locked upstairs room of a property leased through a company controlled by Owen.

He was provided food and water but prevented from contacting anyone.

Owen attempted to obtain the location of Jonathan's backup documents.

Marcus directed the operation remotely and avoided visiting the property.

## The missing documents

Jonathan had anticipated that Marcus might retaliate.

Before entering the hotel, he placed a small encrypted storage device containing selected procurement records in a secure document envelope.

He left the envelope with a trusted legal adviser, Margaret Chen.

Jonathan intended to retrieve it before his testimony.

The storage device contains evidence of Meridian's surveillance and blackmail activities.

It does not identify the ultimate mastermind.

## The real reason Jonathan was taken

Marcus wanted to prevent Jonathan from exposing the intelligence operation.

He also wanted to recover the documents and determine whether Jonathan had disclosed information to investigators.

## The connection to The Ledger

Some companies receiving suspicious foundation-related payments in S01 C01 also paid Meridian for intelligence and corporate risk services.

The financial and intelligence operations are connected through Meridian.

Adrian Cross and Marcus Shaw are separate senior operators within the same broader organization.

The player can establish this connection using evidence from both cases.

## The larger secret

Marcus reports to an unidentified superior through a compartmentalized communication system.

One recovered instruction contains the designation "A."

The player must not learn that A refers to Evelyn Voss.

Marcus himself knows that a powerful individual oversees the network, but he does not freely disclose that person's identity.

Evelyn is not an active suspect in this case.

---

# 4. THE VICTIM

## Jonathan Price

Character ID: CH01
Age: 41
Occupation: Senior procurement analyst
Employer: Eastbridge Systems
Residence: Arlington, Virginia
Status: Missing at opening, alive at conclusion

### Personality

Intelligent, cautious, increasingly anxious, and ashamed of his involvement.

Jonathan is not entirely innocent.

He knowingly supplied confidential information in exchange for financial assistance.

However, his misconduct does not justify his kidnapping.

### What he knows

- Marcus recruited him through an intermediary.
- Meridian received confidential information.
- The network used compromising information to pressure people.
- Owen coordinated his kidnapping.
- Daniel assisted with the hotel escape route.
- Marcus directed the operation.

### What he does not know

- Evelyn Voss's role.
- The complete structure of the criminal network.
- The identities of every Meridian operator.
- The future crimes in the series.

Jonathan's testimony becomes available only after his rescue.

---

# 5. INTERVIEWABLE CHARACTERS

Implement 11 interviewable characters, including Jonathan after rescue.

Each character needs:

- Unique ID
- Portrait
- Biography
- Personality
- Knowledge boundaries
- Initial dialogue
- Evidence-dependent dialogue
- Contradictions
- Availability states
- Re-interview unlocks
- Final case state

## CH02: Natalie Price

Age: 37
Occupation: Physical therapist
Role: Client and Jonathan's sister

Natalie believes Jonathan would never disappear voluntarily.

She knows he had been under financial pressure.

She remembers him mentioning a meeting with a lawyer.

She does not know he had been providing confidential information.

Innocent.

## CH03: Marcus Shaw

Age: 46
Occupation: Director of Corporate Intelligence, Meridian Advisory Group
Role: Senior organizer of the kidnapping

Marcus presents himself as a polished corporate risk consultant.

He claims Meridian provides legitimate security and compliance services.

He knows Jonathan supplied information to the organization.

He ordered Owen to recover Jonathan and the records.

He avoids discussing his superiors.

Marcus is not the ultimate mastermind.

## CH04: Owen Mercer

Age: 39
Occupation: Private security and intelligence contractor
Role: Kidnapping coordinator

Owen directly threatened, restrained, and transported Jonathan.

He arranged the holding property.

He claims Jonathan voluntarily agreed to a private meeting.

He is lying.

## CH05: Daniel Hurst

Age: 32
Occupation: Ashcroft Hotel maintenance employee
Role: Hotel accomplice

Daniel provided access to the restricted service corridor.

He disabled a service alarm.

He helped move Jonathan.

He was motivated by money and debt.

He becomes increasingly frightened as evidence accumulates.

## CH06: Margaret Chen

Age: 48
Occupation: Attorney
Role: Jonathan's trusted legal adviser

Margaret possesses the sealed envelope containing Jonathan's backup records.

She does not initially disclose the envelope's contents.

She cooperates once the player establishes the connection to Jonathan's planned testimony.

Innocent.

## CH07: Olivia Grant

Age: 44
Occupation: Ashcroft Hotel general manager

Olivia is concerned about the hotel's reputation.

She initially minimizes the possibility of a security failure.

She did not participate in the kidnapping.

She can authorize access to certain hotel records.

## CH08: Peter Wallace

Age: 56
Occupation: Hotel security director

Peter oversees surveillance and access logs.

He initially believes Jonathan left voluntarily.

He discovers discrepancies in maintenance access records.

Innocent.

## CH09: Rachel Monroe

Age: 29
Occupation: Hotel front desk supervisor

Rachel checked Jonathan into Room 614.

She remembers a visitor asking about Jonathan's room.

She is uncertain whether the visitor was Owen.

Innocent.

## CH10: David Ellis

Age: 52
Occupation: Eastbridge Systems compliance director

David knows Jonathan was being questioned about procurement irregularities.

He initially withholds information about the company's internal investigation.

He is concerned about professional consequences.

He is not involved in the kidnapping.

## CH11: Detective Sarah Collins

Age: 42
Occupation: Metropolitan Police Department detective

Sarah is the primary law-enforcement contact.

She initially considers voluntary disappearance plausible.

She provides police records and coordinates the eventual rescue.

She is not corrupt.

### Character knowledge rules

No character may know facts they could not reasonably have learned.

Do not allow Marcus to reveal Evelyn's identity.

Do not make every suspect confess when confronted with a single clue.

Interviews must evolve as evidence is discovered.

---

# 6. LOCATIONS

Implement 12 primary locations.

## L01: Blackwood Office

The existing office hub.

Contains:
- New case briefing
- Notebook
- Current Murder Board
- Persistent wheeled series board
- Telephone
- Travel access

The series board must remain unchanged from S01 C01.

## L02: Ashcroft Hotel Lobby

Contains:
- Reception desk
- Guest check-in records
- Front desk interview
- Hotel layout information

## L03: Room 614

Primary disappearance scene.

Contains:
- Jonathan's luggage
- Personal phone
- Disturbed bedside table
- Laptop power cable
- Missing laptop location
- Personal notes
- Door access information

## L04: Sixth-Floor Corridor

Contains:
- Guest corridor
- Room entrance
- Camera coverage
- Service-door access
- Witness observation points

## L05: Hotel Security Office

Contains:
- Surveillance footage
- Access logs
- Security incident reports
- Maintenance schedules

## L06: Hotel Service Corridor

Initially locked.

Contains:
- Restricted access reader
- Service elevator
- Alarm control
- Evidence of unusual movement

## L07: Hotel Loading Entrance

Contains:
- Delivery records
- Vehicle observations
- Exit route evidence
- Loading camera coverage

## L08: Eastbridge Systems Office

Contains:
- Jonathan's workplace
- Procurement records
- Compliance investigation
- Relevant communications

## L09: Margaret Chen's Law Office

Contains:
- Jonathan's legal correspondence
- Planned testimony information
- Sealed document envelope

## L10: Meridian Advisory Group D.C. Office

Contains:
- Marcus's office
- Corporate intelligence records
- Client contracts
- Communication evidence

Do not expose the wider criminal network.

## L11: Owen Mercer's Security Office

Contains:
- Vehicle records
- Property information
- Work schedules
- Relevant communications

## L12: Maryland Holding Property

Initially locked.

Contains:
- Exterior approach
- Entry area
- Upstairs holding room
- Evidence of confinement
- Jonathan's rescue scene

### Location requirements

Every location must have:
- Original environment artwork
- Interactive hotspots
- Evidence placements
- Unlock conditions
- Relevant characters
- Return-visit states
- Notebook integration
- Murder Board integration

Do not make the player visit all locations in a rigid sequence.

Allow reasonable investigative flexibility.

---

# 7. EVIDENCE MANIFEST

Implement 36 canonical evidence records.

Use globally unique identifiers.

Example:

S001-C02-E001

Do not reuse evidence IDs from S01 C01.

## Group A: Hotel Disappearance

E001: Missing-Person Briefing
The initial report concerning Jonathan's disappearance.

E002: Room 614 Photographs
Shows the room as discovered.

E003: Jonathan's Personal Phone
Contains recent communications and unanswered calls.

E004: Laptop Power Cable
Indicates Jonathan's laptop was removed while other belongings remained.

E005: Hotel Guest Register
Confirms Jonathan's arrival and assigned room.

E006: Room Door Access Log
Shows room access activity during the relevant period.

E007: Sixth-Floor Surveillance Record
Shows movements near the guest corridor.

E008: Service Corridor Access Log
Shows a restricted access event.

E009: Maintenance Alarm Record
Shows an alarm was temporarily disabled.

E010: Hotel Maintenance Schedule
Contains an entry inconsistent with the claimed maintenance activity.

## Group B: Physical Movement

E011: Loading Entrance Camera Record
Shows a vehicle entering the loading area.

E012: Delivery Schedule
Shows no legitimate delivery matching the suspicious vehicle.

E013: Vehicle Description
Witness account of the vehicle near the loading entrance.

E014: Service Elevator Usage Record
Supports the reconstruction of the exit route.

E015: Restricted Access Credential Record
Connects Daniel to the service corridor.

E016: Daniel Hurst Work Schedule
Conflicts with his initial statement.

## Group C: Jonathan's Activities

E017: Procurement Testimony Notice
Confirms Jonathan's planned cooperation.

E018: Eastbridge Compliance Report
Documents procurement irregularities.

E019: Jonathan's Financial Records
Shows unexplained assistance and financial pressure.

E020: Jonathan's Message to Natalie
Indicates he feared consequences for speaking.

E021: Legal Appointment Record
Connects Jonathan to Margaret Chen.

E022: Sealed Document Envelope
Contains the encrypted storage device.

E023: Encrypted Storage Device
Contains selected procurement and Meridian records.

E024: Jonathan's Personal Notes
References a consultant demanding additional information.

## Group D: Suspect Connections

E025: Meridian Consulting Agreement
Shows a professional relationship involving Jonathan.

E026: Marcus Shaw Communication Record
Connects Marcus to Jonathan and Owen.

E027: Owen Mercer Vehicle Record
Connects Owen to the suspicious vehicle.

E028: Owen Mercer Property Lease
Links Owen to the Maryland holding property.

E029: Daniel Hurst Financial Record
Shows a suspicious payment.

E030: Daniel Hurst Communication Record
Connects Daniel to Owen.

E031: Property Access Record
Shows recent activity at the holding property.

E032: Confinement Evidence
Physical evidence supporting Jonathan's involuntary detention.

## Group E: Series Connections

E033: Meridian Intelligence Client List
Shows Meridian's corporate intelligence operations.

E034: Meridian Payment Cross-Reference
Contains companies also appearing in S01 C01.

E035: Compromising Information Index
Shows Meridian collected sensitive information for coercive purposes.

E036: Communication Referencing "A"
A partial instruction sent to Marcus from an unidentified superior.

### E036 content restriction

The record must not identify Evelyn.

The message should be brief, ambiguous, and consistent with later revelations.

Suggested text:

"Contain the Price exposure. Preserve the client structure. Report only when resolved. A."

This establishes the existence of a higher authority without proving their identity.

### Evidence authoring requirements

For all 36 items, provide:
- Full player-visible text or inspection description
- Source
- Discovery location
- Unlock conditions
- Related characters
- Related deductions
- Notebook entry
- Asset requirements
- Critical or supporting classification

Do not substitute these short manifest descriptions for finished content.

Ensure the encrypted storage device has a believable acquisition and examination process.

Do not introduce unrealistic instant decryption.

---

# 8. DEDUCTIONS

Implement 15 primary deductions.

## D01: Jonathan Did Not Pack to Leave

Required:
E002 + E004

Conclusion:
Jonathan's belongings suggest an unexpected departure.

## D02: The Disappearance Was Not Routine

Required:
E003 + E020

Conclusion:
Jonathan's recent concerns make a voluntary disappearance less likely.

## D03: Someone Accessed Room 614

Required:
E006 + E007

Conclusion:
An additional person approached or entered the room during the relevant period.

## D04: The Service Corridor Was Used

Required:
E008 + E014

Conclusion:
The restricted service route was active during the disappearance window.

## D05: The Maintenance Alarm Was Deliberately Disabled

Required:
E009 + E010

Conclusion:
The alarm interruption was not part of legitimate scheduled maintenance.

## D06: Daniel Had Access

Required:
E015 + E016

Conclusion:
Daniel could access the relevant service area and misrepresented his movements.

## D07: The Loading Entrance Was the Exit Route

Required:
E011 + E012 + E013

Conclusion:
A suspicious vehicle was present during the likely exit window.

## D08: Jonathan Was Being Pressured

Required:
E019 + E024

Conclusion:
Jonathan was under financial and professional pressure.

## D09: Jonathan Intended to Disclose Misconduct

Required:
E017 + E018 + E021

Conclusion:
Jonathan was preparing to cooperate regarding procurement irregularities.

## D10: Marcus Had a Motive

Required:
E025 + E026

Conclusion:
Marcus had reason to prevent Jonathan from exposing Meridian's activities.

## D11: Owen Coordinated the Movement

Required:
E027 + E030

Conclusion:
Owen was connected to the vehicle and hotel accomplice.

## D12: Jonathan Was Taken to the Maryland Property

Required:
E028 + E031

Conclusion:
The property was associated with Owen and active during the relevant period.

## D13: Jonathan Was Kidnapped

Required:
D01 + D04 + D05 + D07 + E032

Conclusion:
The combined evidence establishes an involuntary removal and confinement.

## D14: Marcus Directed the Kidnapping

Required:
D08 + D09 + D10 + D11 + D13

Conclusion:
Marcus organized the operation through Owen to prevent disclosure.

## D15: Meridian's Operations Extend Beyond Financial Consulting

Required:
E023 + E033 + E035

Conclusion:
Meridian collected sensitive information and used it for leverage.

### Deduction validation

Do not create circular dependencies.

Do not treat a single access record as proof of kidnapping.

Do not use an unidentified communication to prove Evelyn's identity.

All conclusions must be supported by the available evidence.

---

# 9. FOUR-ACT STRUCTURE

## ACT 1: THE EMPTY ROOM

Target duration: 30–40 minutes.

The player receives Natalie's briefing.

Available locations:
- Blackwood office
- Hotel lobby
- Room 614
- Sixth-floor corridor
- Police department contact

Objectives:
1. Examine Room 614.
2. Interview hotel staff.
3. Establish Jonathan's recent activities.
4. Identify inconsistencies in the voluntary disappearance theory.

Act conclusion:
Someone likely entered Jonathan's room shortly before he disappeared.

## ACT 2: THE SERVICE EXIT

Target duration: 35–40 minutes.

New locations:
- Hotel security office
- Service corridor
- Loading entrance

Objectives:
1. Reconstruct hotel access.
2. Investigate the disabled alarm.
3. Identify Daniel's involvement.
4. Trace the suspicious vehicle.
5. Establish the likely exit route.

Act conclusion:
The player establishes that Jonathan was moved through a restricted service route.

## ACT 3: THE PRICE OF SILENCE

Target duration: 35–45 minutes.

New locations:
- Eastbridge Systems
- Margaret Chen's office
- Meridian office
- Owen's office

Objectives:
1. Investigate Jonathan's financial pressures.
2. Examine procurement irregularities.
3. Discover Marcus's involvement.
4. Recover Jonathan's backup records.
5. Identify Owen's property connection.

Act conclusion:
The player identifies the likely holding location.

## ACT 4: ROOM WITHOUT A NUMBER

Target duration: 35–45 minutes.

New location:
- Maryland holding property

Objectives:
1. Coordinate Jonathan's recovery.
2. Examine the confinement scene.
3. Interview Jonathan.
4. Establish Daniel and Owen's roles.
5. Establish Marcus's direction.
6. Identify Meridian's intelligence operation.
7. Complete the final case report.

Act conclusion:
Jonathan is rescued and the kidnapping is solved.

The larger criminal network remains unresolved.

---

# 10. REACTIVE EVENTS

Implement eight authored events.

## RE01: Natalie Receives an Unanswered Call

Trigger:
Player discovers Jonathan's phone records.

Effect:
Natalie recalls Jonathan's anxiety before the trip.

## RE02: Hotel Security Finds an Anomaly

Trigger:
Player examines access records.

Effect:
Peter Wallace provides an updated security report.

## RE03: Daniel Changes His Story

Trigger:
Player establishes the alarm interruption.

Effect:
Daniel admits he entered the service area but denies helping move Jonathan.

## RE04: Marcus Contacts Blackwood

Trigger:
Player begins investigating Meridian.

Effect:
Marcus offers a polished explanation of the company's work.

## RE05: Margaret Reveals the Envelope

Trigger:
Player establishes Jonathan's planned testimony.

Effect:
The sealed envelope becomes available through appropriate authorization.

## RE06: Owen Attempts to Relocate Jonathan

Trigger:
Player identifies the holding property and completes the necessary evidence chain.

Effect:
Creates urgency through an authored narrative event.

Do not use a real-time countdown.

Do not move Jonathan to an undiscoverable location.

## RE07: Jonathan Is Recovered

Trigger:
Player completes the holding-property investigation and coordinates police intervention.

Effect:
Jonathan becomes interviewable.

## RE08: The Unknown Superior

Trigger:
Player completes the Meridian intelligence deduction.

Effect:
E036 becomes available.

A new series-level notebook entry is created.

Do not automatically pin E036 to the wheeled board.

---

# 11. RESCUE SEQUENCE

Jonathan must survive.

The rescue should be an investigative climax, not a combat sequence.

Blackwood identifies the property and provides sufficient evidence for law enforcement to intervene.

Players examine the scene and help reconstruct the confinement.

For solo play:
- One player can complete every required action.
- No teammate-dependent puzzles.
- No unavoidable failure.

For multiplayer:
- Players can investigate separate areas.
- Shared evidence updates synchronize.
- No player is required to remain idle.
- The rescue event occurs once per session.

Do not introduce firearms combat or action-game mechanics.

---

# 12. INTERVIEW MECHANICS

Reuse the established Blackwood interview system.

Initial question limit: 20 per character.

At approximately 15 questions, characters begin indicating that the conversation is ending.

At 20 questions, the interview concludes.

New evidence may unlock five-question follow-up interviews.

Preserve existing Standard and Hardcore credit mechanics.

## Important interview progression

Marcus:
- Initially cooperative and polished.
- Becomes defensive about Jonathan.
- Minimizes Meridian's intelligence work.
- Denies ordering a kidnapping.
- Does not identify the mastermind.

Daniel:
- Initially claims routine maintenance.
- Admits the service alarm interruption.
- Eventually becomes implicated in the exit route.

Owen:
- Initially denies involvement.
- Claims Jonathan attended a voluntary meeting.
- Is contradicted by the holding-property evidence.

Jonathan:
- Unavailable until rescue.
- Initially ashamed of his misconduct.
- Eventually explains Marcus's coercion.
- Provides direct testimony about the kidnapping.

Margaret:
- Initially protects client confidentiality.
- Provides appropriate records when authorization is established.

All characters require complete authored responses.

Do not use generic AI responses that accidentally reveal the solution.

---

# 13. THE TWO CORK BOARDS

## Original Murder Board

Used for Room 614.

Contains:
- Jonathan's disappearance
- Hotel evidence
- Suspects
- Vehicle records
- Kidnapping deductions
- Final case reconstruction

## Wheeled Series Board

Used for The Judas Principle.

Contains:
- Previously pinned evidence from The Ledger
- Previously created yarn connections
- Previously saved notes
- New evidence the player chooses to pin

The board must not reset.

### Cross-case deduction example

The player may pin:

S001-C01-E029: Meridian Payment Pattern

and

S001-C02-E034: Meridian Payment Cross-Reference

The player may connect them to establish:

"Companies associated with the foundation transactions also appear in Meridian's intelligence-related payments."

This is a series-level deduction.

It must be initiated by the player.

Do not automatically create the connection.

### Series-level deduction

Create:

S001-D001: The Financial and Intelligence Operations Are Connected

Required evidence:
S001-C01-E029
S001-C02-E034

Result:
A verified connection between the financial operation uncovered in The Ledger and the intelligence operation uncovered in Room 614.

This deduction belongs to the series, not either individual case.

It persists into S01 C03 and later cases.

If the player has not discovered the earlier evidence, the series deduction remains incomplete.

Do not block completion of Room 614 because of an incomplete series deduction.

---

# 14. FINAL CASE REPORT

The player must answer:

Who was kidnapped?
Jonathan Price.

Who coordinated the kidnapping?
Owen Mercer.

Who helped move Jonathan through the hotel?
Daniel Hurst.

Who directed the operation?
Marcus Shaw.

Why was Jonathan kidnapped?
To prevent disclosure of Meridian's intelligence operation and recover sensitive documents.

How was Jonathan removed from the hotel?
Through a restricted service corridor and loading entrance.

Where was Jonathan held?
A private property in Maryland connected to Owen.

What was Meridian doing?
Collecting confidential and compromising information to influence and pressure individuals.

Was Jonathan an entirely innocent participant?
No. He previously supplied confidential information, then attempted to cooperate with investigators.

Does the case identify the mastermind?
No.

### Completion requirements

Require evidence-supported answers.

Allow incorrect submissions to be revised.

Do not accept unsupported accusations.

The player must not be required to complete optional series deductions to finish the case.

---

# 15. ENDING SEQUENCE

After Jonathan's rescue and the final report, Blackwood returns to the office.

The original Murder Board contains the completed Room 614 investigation.

The wheeled board remains available.

The notebook receives a new entry:

**THE JUDAS PRINCIPLE**

"The money trail from Bellwether has led to something more troubling.

Meridian Advisory Group is not simply moving funds.

Someone is collecting secrets.

And someone above the people we've identified is giving instructions."

If E036 was discovered, the notebook may mention the unidentified designation "A."

Do not identify A.

The player may manually pin relevant evidence to the wheeled board.

S01 C02 is marked complete.

S01 C03: Dead Freight becomes available.

Do not automatically start the next case.

---

# 16. VISUAL DIRECTION

Washington, D.C., November 2018.

Use:
- Contemporary painted crime-drama illustrations
- Gouache and oil textures
- Subtle film grain
- Rain-wet streets
- Upscale hotel interiors
- Warm lamps against cold blue-gray shadows
- Corporate offices
- Restricted service corridors
- Realistic 2018 phones and computers
- Maryland suburban and rural environments

No 1980s styling.

No supernatural explanations.

No futuristic surveillance technology.

The hotel must feel believable and geographically consistent.

The service route must be physically plausible.

---

# 17. IMPLEMENTATION ORDER

Phase 1: Inspect S01 C01 and verify existing series infrastructure.

Phase 2: Confirm the persistent wheeled board survives case transitions.

Phase 3: Implement the Room 614 case record and four-act progression.

Phase 4: Author the complete 36-item evidence manifest.

Phase 5: Implement and validate all 15 deductions.

Phase 6: Build the 12 locations and interactive hotspots.

Phase 7: Implement 11 characters and complete interview dialogue.

Phase 8: Implement eight reactive events.

Phase 9: Build the kidnapping reconstruction and rescue sequence.

Phase 10: Implement the final report and case ending.

Phase 11: Implement the first cross-case series deduction.

Phase 12: Test solo, multiplayer, persistence, alternative investigation orders, and softlock prevention.

---

# 18. ACCEPTANCE CRITERIA

Room 614 is complete when:

1. S01 C02 appears correctly under Series S001.
2. The Ledger's series board state persists.
3. The new case begins with briefing paperwork.
4. The original Murder Board is ready for the new investigation.
5. All 12 locations are implemented.
6. All 11 characters have authored interviews.
7. All 36 evidence items are discoverable.
8. All 15 case deductions work.
9. All eight reactive events work.
10. Jonathan's disappearance can be reconstructed.
11. The player can identify the hotel accomplice.
12. The player can identify Owen's role.
13. The player can establish Marcus's direction.
14. Jonathan is recovered alive.
15. Meridian's intelligence operation is exposed.
16. The unidentified "A" reference is discoverable.
17. Evelyn's identity remains secret.
18. The cross-case series deduction works when the required evidence is available.
19. Cross-case deductions are never automatically completed.
20. The wheeled board preserves all player-created connections.
21. Multiplayer state remains synchronized.
22. No critical softlocks exist.
23. No purchased interview questions are required to solve the case.
24. Existing cases remain functional.
25. S01 C03 unlocks only after successful completion.

---

# FINAL INSTRUCTION

Implement S01 C02: Room 614 as the second investigation in The Judas Principle.

This case must feel like a complete missing-person and kidnapping mystery while revealing a new layer of Meridian Advisory Group.

Preserve the series continuity established in The Ledger.

The player should finish knowing that Meridian is involved in far more than suspicious financial transactions.

They should also understand that someone appears to be directing Marcus Shaw from above.

They must not yet know who that person is.

The wheeled cork board must remain the player's persistent, manually assembled record of the larger conspiracy.

Audit the existing implementation before making changes. Preserve working systems and use the smallest compatible architectural extensions.