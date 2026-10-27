# BLACKWOOD INVESTIGATIONS
# SERIES S001: THE JUDAS PRINCIPLE
# CASE S01 C03: DEAD FREIGHT

## COMPLETE STORY BIBLE AND IMPLEMENTATION SPECIFICATION

You are implementing the third case in Blackwood Investigations' connected six-case series, The Judas Principle.

This case must integrate with the existing Blackwood game and the series infrastructure established in S01 C01: The Ledger and S01 C02: Room 614.

Do not create a standalone application.

Before implementing, inspect the existing codebase and verify the current series progression, case transitions, persistent wheeled cork board, interview system, evidence system, deductions, reactive events, notebook, multiplayer, and save functionality.

Preserve existing behavior.

Do not reveal the identity of the series mastermind.

---

# 1. CASE INFORMATION

Series ID: S001
Series title: The Judas Principle
Internal case ID: S001-C03
Player-facing ID: S01 C03
Case title: Dead Freight
Location: Baltimore, Maryland
Date: December 3–5, 2018
Target duration: 150–180 minutes
Players: 1–6
Difficulty: Advanced
Genre: Murder mystery, organized crime, industrial investigation

Case structure: Four acts
Primary locations: 13
Interviewable characters: 11
Evidence items: 40
Primary deductions: 16
Reactive events: 8
Series deductions introduced: 2

## Case premise

Samuel Ortiz, a 39-year-old dockworker at Baltimore's fictional East Harbor Terminal, is found murdered near a shipping container staging area.

Samuel had recently reported discrepancies in shipping manifests and unexplained nighttime cargo movements.

His employer insists that the discrepancies were routine administrative errors.

Police initially suspect a robbery or a dispute between dockworkers.

Samuel's wife, Elena Ortiz, believes he was killed because of something he discovered at work.

She hires Blackwood Investigations.

As Blackwood investigates, the player discovers that legitimate freight companies have been used to conceal stolen goods, illicit cash movements, and payments connected to criminal operations.

The investigation leads toward Victor Kane, a logistics contractor who manages enforcement and transportation for Meridian's wider network.

The player must identify Samuel's murderer, determine who ordered the intimidation, and establish the connection between the freight operation and Meridian Advisory Group.

The murder is solved by the end of the case.

The wider criminal organization remains active.

---

# 2. SERIES CONTINUITY

The following cases have already occurred:

S01 C01: The Ledger
S01 C02: Room 614

The player has previously uncovered:

- Suspicious financial transactions involving Meridian Advisory Group.
- Adrian Cross's involvement in fraudulent financial activity.
- Meridian's intelligence and blackmail operation.
- Marcus Shaw's role in directing the kidnapping of Jonathan Price.
- A communication referring to an unidentified superior as "A."

Do not assume every optional evidence item was discovered or pinned.

## Starting state

When S01 C03 begins:

1. The original Murder Board is cleared for the new case.
2. The wheeled series board remains exactly as the player left it.
3. All previously pinned evidence remains in place.
4. All red-yarn connections remain unchanged.
5. All player-created notes remain saved.
6. Previous series deductions remain completed.
7. The office desk contains the new case briefing.
8. The case map initially shows only appropriate starting locations.

Do not automatically add evidence from previous cases to the current Murder Board.

Do not automatically pin anything to the wheeled board.

Do not automatically create connections between cases.

## Existing series evidence references

Relevant evidence may include:

S001-C01-E011: Hidden Handwritten Ledger
S001-C01-E016: Meridian Consulting Invoice
S001-C01-E019: Post-Murder Transfer Record
S001-C01-E029: Meridian Payment Pattern

S001-C02-E023: Encrypted Storage Device
S001-C02-E025: Meridian Consulting Agreement
S001-C02-E033: Meridian Intelligence Client List
S001-C02-E034: Meridian Payment Cross-Reference
S001-C02-E035: Compromising Information Index
S001-C02-E036: Communication Referencing "A"

These must remain references to existing canonical evidence.

Do not create duplicate records.

---

# 3. CANONICAL TRUTH

AUTHOR-ONLY INFORMATION.

Never expose this section through player-visible metadata, opening narration, or early dialogue.

## Meridian's freight operation

Victor Kane operates a logistics and enforcement network that uses legitimate shipping companies to move stolen commercial goods and conceal payments associated with criminal activity.

Victor is connected to Meridian Advisory Group through consulting contracts and intermediary companies.

Adrian Cross has helped establish financial channels used by Victor's operation.

Marcus Shaw's intelligence network has supplied compromising information used to pressure certain shipping executives into cooperating.

Victor is not the mastermind.

He reports through a compartmentalized chain of authority.

## Samuel Ortiz's discovery

Samuel was a reliable dockworker who handled cargo verification and staging.

During November 2018, he noticed several shipping containers arriving with documentation that did not match their recorded contents.

He also noticed that certain containers were moved outside normal scheduling procedures.

Samuel began documenting discrepancies in a personal notebook.

He photographed container identification numbers, vehicle movements, and altered shipping paperwork.

He reported his concerns to his supervisor, Leonard Briggs.

Leonard dismissed the discrepancies and warned Samuel to stop interfering.

Samuel became suspicious that Leonard was involved.

## Leonard's involvement

Leonard Briggs was being pressured by Victor's organization.

Marcus's intelligence network had obtained information about Leonard's financial misconduct at a previous employer.

Victor used that information to force Leonard to approve suspicious cargo movements.

Leonard cooperated because he feared exposure.

Leonard did not order Samuel's murder.

He later attempted to conceal evidence of the shipping irregularities.

## Victor's response

Victor learned that Samuel was collecting evidence.

Victor instructed Thomas Bell, one of his enforcement contractors, to confront Samuel, frighten him into silence, and recover the notebook and photographs.

Victor authorized intimidation and theft.

He did not explicitly order Samuel's murder.

## The murder

On December 2, 2018, Thomas Bell approached Samuel near a restricted container staging area after Samuel's shift.

Thomas demanded Samuel's notebook and phone.

Samuel refused.

A struggle followed.

Thomas struck Samuel with a heavy steel cargo-securing bar.

Samuel died from the injury.

Thomas took Samuel's phone but failed to recover the notebook, which Samuel had concealed inside a locked equipment cabinet.

Thomas moved Samuel's body behind a stack of cargo equipment and disturbed his belongings to suggest a robbery.

Thomas left the terminal using a contractor access route.

## After the murder

Thomas contacted Victor.

Victor learned that Samuel had been killed.

Victor arranged for Thomas to receive money through a freight-services intermediary.

He also instructed Leonard to alter certain cargo records and discourage further questions.

Victor's actions after the murder establish his role in concealing the crime.

## The broader network

The investigation uncovers three connected operations:

1. Adrian Cross's financial network.
2. Marcus Shaw's intelligence and blackmail operation.
3. Victor Kane's criminal freight and enforcement operation.

These operations share financial intermediaries, corporate clients, and communication channels.

The player can establish that they are part of a coordinated organization.

## The Architect

A recovered internal document refers to a superior known as "The Architect."

This is the first explicit use of that title in the series.

The document does not identify the person.

The player must not learn that Evelyn Voss is the Architect.

## Evelyn's hidden involvement

Evelyn knows Victor's operation has become reckless.

She is concerned that violent incidents may expose the larger organization.

She has allowed information to reach Blackwood that makes Victor's activities easier to investigate.

However, Evelyn does not appear as an obvious suspect in Dead Freight.

Do not reveal this manipulation yet.

---

# 4. VICTIM

## Samuel Ortiz

Character ID: CH01
Age: 39
Occupation: Dockworker and cargo verification specialist
Employer: East Harbor Terminal
Residence: Baltimore, Maryland
Marital status: Married
Children: One daughter, age 9

### Personality

Responsible, observant, hardworking, and protective of his family.

Samuel believed the shipping discrepancies endangered workers and concealed criminal activity.

### Relevant relationships

- Elena Ortiz: Wife
- Leonard Briggs: Supervisor
- Thomas Bell: Enforcement contractor
- Victor Kane: Logistics contractor
- Marcus Shaw: Unknown to Samuel
- Adrian Cross: Unknown to Samuel

### Cause of death

Fatal blunt-force head injury.

Murder weapon: Heavy steel cargo-securing bar.

Death occurred on December 2, 2018.

---

# 5. INTERVIEWABLE CHARACTERS

Implement 11 interviewable characters.

Each requires:
- Character ID
- Name
- Age
- Occupation
- Portrait
- Biography
- Personality
- Knowledge boundaries
- Initial interview dialogue
- Evidence-dependent dialogue
- Contradictions
- Re-interview conditions
- Availability states
- Final case state

## CH02: Elena Ortiz

Age: 37
Occupation: Medical office administrator
Role: Client and Samuel's wife

Elena believes Samuel was killed because of his work.

She knows he had been worried about unusual cargo movements.

She recalls him mentioning a notebook.

She is innocent.

She does not know who killed him.

## CH03: Leonard Briggs

Age: 55
Occupation: Terminal operations supervisor

Leonard approved suspicious cargo movements under pressure.

He knows Victor's organization was involved.

He initially minimizes Samuel's concerns.

He is not responsible for the murder.

He fears that his own misconduct will be exposed.

## CH04: Victor Kane

Age: 48
Occupation: Logistics and security contractor
Role: Organizer of the intimidation operation

Victor manages criminal logistics for Meridian's network.

He instructed Thomas to intimidate Samuel and recover his records.

He later helped conceal Thomas's involvement.

He did not explicitly order Samuel's murder.

Victor is controlled, intimidating, and confident.

He does not identify the Architect.

## CH05: Thomas Bell

Age: 34
Occupation: Freight security contractor
Role: Actual murderer

Thomas confronted Samuel.

He killed Samuel during the struggle.

He stole Samuel's phone.

He initially claims he was working elsewhere.

His account conflicts with access records, vehicle movements, and physical evidence.

## CH06: Marcus Shaw

Age: 46
Occupation: Director of Corporate Intelligence, Meridian Advisory Group

Marcus previously appeared in Room 614.

He supplied compromising information used to pressure Leonard.

He knows Victor operates within the same network.

He denies involvement in Samuel's murder.

His interview must reflect the outcome of S01 C02.

If Marcus is in custody, use a legally plausible authorized interview or recorded statement rather than portraying him as freely operating.

Do not reset his established character history.

## CH07: Adrian Cross

Age: 49
Occupation: Financial consultant

Adrian previously appeared in The Ledger.

He helped establish payment channels associated with Victor's operation.

His availability must reflect the outcome of S01 C01.

Do not contradict earlier case conclusions.

Adrian does not directly participate in Samuel's murder.

## CH08: Rachel Bennett

Age: 31
Occupation: Cargo documentation clerk

Rachel noticed unusual changes to shipping manifests.

She initially believes the changes were administrative errors.

She later admits Leonard instructed her to replace several documents.

She is innocent.

## CH09: David Mercer

Age: 43
Occupation: Truck driver

David transported cargo associated with the suspicious shipments.

He noticed unusual scheduling and payment arrangements.

He did not know the full criminal purpose.

He is innocent of murder.

## CH10: Frank Sullivan

Age: 62
Occupation: Retired dockworker and union representative

Frank knows the terminal's operating procedures.

He can explain why the cargo movements were unusual.

He is suspicious of Leonard.

He is innocent.

## CH11: Detective Allison Grant

Age: 45
Occupation: Baltimore Police Department detective

Allison oversees the murder investigation.

She initially considers robbery plausible.

She provides forensic findings and coordinates evidence recovery.

She is not corrupt.

## CH12: Peter Walsh

Age: 40
Occupation: Freight company accountant

Peter handles payments and invoices.

He knows some contracts were irregular.

He initially fears professional consequences.

He can help establish the financial connection between Victor and Meridian.

He is innocent of murder.

---

# 6. LOCATIONS

Implement 13 primary locations.

## L01: Blackwood Office

Existing office hub.

Contains:
- New case briefing
- Notebook
- Current Murder Board
- Persistent wheeled series board
- Telephone
- Travel access

## L02: East Harbor Terminal Entrance

Contains:
- Security checkpoint
- Visitor records
- Contractor access information
- Initial interviews

## L03: Container Staging Area

Primary murder scene.

Contains:
- Cargo equipment
- Samuel's final work area
- Physical evidence
- Restricted access route
- Scene photographs

## L04: Cargo Verification Office

Contains:
- Shipping manifests
- Samuel's work records
- Documentation systems
- Rachel Bennett

## L05: Equipment Storage Building

Contains:
- Locked equipment cabinet
- Samuel's hidden notebook
- Maintenance records
- Physical evidence

## L06: Terminal Security Office

Contains:
- Access logs
- Camera records
- Contractor credentials
- Vehicle movement records

## L07: Ortiz Family Home

Contains:
- Samuel's personal correspondence
- Family photographs
- Elena Ortiz
- Background information

## L08: Leonard Briggs's Office

Contains:
- Shift schedules
- Altered manifests
- Internal communications
- Supervisor records

## L09: Kane Logistics Office

Contains:
- Victor's business records
- Contractor agreements
- Payment documents
- Vehicle records

## L10: Bell Freight Security Yard

Contains:
- Thomas's vehicle
- Work equipment
- Contractor schedules
- Financial records

## L11: Freight Accounting Office

Contains:
- Invoices
- Payment records
- Intermediary company information
- Peter Walsh

## L12: Baltimore Police Department

Contains:
- Police reports
- Forensic updates
- Detective Grant
- Authorized interviews

## L13: Riverside Freight Transfer Yard

Contains:
- Suspicious shipment records
- Vehicle activity
- Cargo movement evidence
- Final freight-network reconstruction

### Location requirements

Every location must include:
- Original environment artwork
- Interactive hotspots
- Evidence placements
- Unlock conditions
- Relevant characters
- Return-visit states
- Notebook integration
- Murder Board integration

Use period-accurate 2018 shipping and industrial equipment.

---

# 7. EVIDENCE MANIFEST

Implement exactly 40 canonical evidence records.

Use globally unique IDs.

Example:

S001-C03-E001

Each evidence item requires:
- Exact ID
- Name
- Type
- Full player-visible inspection text
- Source and provenance
- Discovery location
- Unlock conditions
- Related characters
- Related deductions
- Notebook entry
- Asset requirements
- Critical or supporting classification

## Group A: Samuel's Murder

E001: Initial Police Report
Documents Samuel's discovery and the apparent robbery.

E002: Crime Scene Photographs
Shows the body location, disturbed belongings, and nearby cargo equipment.

E003: Medical Examiner Summary
Establishes fatal blunt-force trauma.

E004: Cargo-Securing Bar
The murder weapon, recovered during the investigation.

E005: Partial Footwear Impression
Provides limited physical comparison.

E006: Samuel's Missing Phone Record
Establishes that his phone was taken.

E007: Restricted Area Access Log
Shows unusual access near the murder window.

E008: Contractor Vehicle Observation
Places a suspicious vehicle near the scene.

## Group B: Samuel's Investigation

E009: Samuel's Personal Notebook
Documents suspicious cargo movements.

E010: Container Identification Photographs
Shows specific container numbers.

E011: Original Shipping Manifest
Lists the declared cargo.

E012: Altered Shipping Manifest
Contains inconsistent information.

E013: Cargo Movement Schedule
Shows unusual nighttime movements.

E014: Samuel's Report to Leonard
Documents his concerns.

E015: Leonard's Written Response
Dismisses the discrepancies.

E016: Equipment Cabinet Access Record
Helps establish where Samuel concealed his notebook.

## Group C: Suspect Connections

E017: Thomas Bell Work Schedule
Conflicts with his initial alibi.

E018: Thomas Bell Contractor Credential
Shows access to the terminal.

E019: Thomas Bell Vehicle Record
Connects his vehicle to the relevant area.

E020: Thomas Bell Financial Statement
Shows a suspicious payment.

E021: Victor Kane Communication Record
Connects Victor and Thomas.

E022: Victor Kane Contractor Agreement
Establishes their professional relationship.

E023: Leonard Briggs Communication Record
Shows contact with Victor's operation.

E024: Leonard Briggs Financial Disclosure
Explains his vulnerability to coercion.

E025: Rachel Bennett Statement
Documents instructions to alter shipping paperwork.

E026: David Mercer Driver Log
Shows unusual cargo movement.

E027: Security Camera Record
Supports the reconstruction of Thomas's movements.

E028: Recovered Phone Evidence
Contains information recovered through lawful investigative procedures.

## Group D: Financial and Freight Network

E029: Kane Logistics Invoice
Documents suspicious freight-services payments.

E030: Freight Intermediary Registration
Connects a shell company to Victor's operation.

E031: Meridian Advisory Group Payment Record
Shows financial ties to the freight operation.

E032: Adrian Cross Financial Authorization
Connects Adrian's financial network to freight-related payments.

E033: Marcus Shaw Intelligence Reference
Shows that compromising information was used to pressure Leonard.

E034: Terminal Contract Amendment
Shows changes benefiting the suspicious freight operation.

E035: Freight Transfer Yard Record
Connects multiple suspicious shipments.

E036: Consolidated Cargo Discrepancy Report
Summarizes the mismatched records.

## Group E: Series Evidence

E037: Shared Meridian Client Reference
Shows clients appearing in financial and intelligence records from earlier cases.

E038: Intermediary Payment Network
Connects Adrian's financial operation to Victor's logistics network.

E039: Internal Organization Reference
Suggests that separate operations report through a shared authority.

E040: Document Referencing "The Architect"
Contains the first explicit reference to the title.

### E040 content

Use a believable internal memorandum or communication fragment.

Suggested wording:

"Operational concerns are to be escalated through the designated channel. No direct contact with the Architect is permitted without authorization."

Do not identify the Architect.

Do not mention Evelyn Voss.

Do not imply the document alone proves the identity of the mastermind.

### Evidence authoring requirements

The descriptions above are an evidence outline, not completed evidence content.

Before gameplay implementation, expand every item into a complete authored record.

Avoid generic filler documents.

Ensure all evidence supports the canonical investigation.

Do not create impossible forensic certainty.

---

# 8. DEDUCTIONS

Implement exactly 16 primary case deductions.

## D01: The Robbery Was Staged

Required:
E001 + E002 + E006

Conclusion:
The scene was arranged to suggest robbery, but the evidence indicates targeted interference.

## D02: Samuel Was Investigating Cargo Irregularities

Required:
E009 + E014

Conclusion:
Samuel was documenting suspicious shipments before his death.

## D03: Shipping Records Were Altered

Required:
E011 + E012

Conclusion:
The same shipment was described differently in separate records.

## D04: Cargo Movements Were Unauthorized

Required:
E013 + E026

Conclusion:
Certain cargo movements did not follow normal scheduling procedures.

## D05: Leonard Suppressed Samuel's Concerns

Required:
E014 + E015

Conclusion:
Leonard dismissed documented concerns without resolving them.

## D06: Thomas Had Access to the Scene

Required:
E007 + E018

Conclusion:
Thomas could enter the restricted staging area.

## D07: Thomas's Alibi Was False

Required:
E017 + E027

Conclusion:
Thomas's recorded movements conflict with his statement.

## D08: Thomas Was Connected to the Suspicious Vehicle

Required:
E008 + E019

Conclusion:
Thomas's vehicle is consistent with the vehicle observed near the scene.

## D09: Thomas Killed Samuel

Required:
D01 + D06 + D07 + D08 + E003 + E004

Conclusion:
The combined evidence supports Thomas as Samuel's murderer.

## D10: Victor Directed the Intimidation

Required:
E021 + E022 + E023

Conclusion:
Victor coordinated the effort to pressure Samuel and suppress his investigation.

## D11: Victor Concealed the Crime

Required:
E020 + E021 + E029

Conclusion:
Victor maintained contact with Thomas and arranged suspicious payment activity after the murder.

## D12: Leonard Was Being Coerced

Required:
E024 + E033

Conclusion:
Leonard's cooperation was influenced by compromising information.

## D13: The Freight Operation Was Organized

Required:
E030 + E034 + E035

Conclusion:
The suspicious shipments formed part of a coordinated operation.

## D14: Meridian Financed Freight Activity

Required:
E031 + E032

Conclusion:
Meridian-linked financial channels supported the freight operation.

## D15: Meridian's Operations Were Connected

Required:
E033 + E037 + E038

Conclusion:
Financial, intelligence, and logistics activities shared operational relationships.

## D16: A Higher Authority Exists

Required:
E039 + E040

Conclusion:
The available records suggest an authority operating above the identified managers.

### Deduction validation

Do not create circular dependencies.

Do not allow the player to identify Evelyn from these deductions.

Distinguish Victor ordering intimidation from Thomas independently committing murder.

Do not assume every suspicious payment proves criminal intent.

---

# 9. FOUR-ACT STRUCTURE

## ACT 1: THE BODY AT THE DOCK

Target duration: 30–40 minutes.

Available:
- Blackwood office
- Terminal entrance
- Container staging area
- Ortiz home
- Police contact

Objectives:
1. Examine Samuel's murder scene.
2. Interview Elena.
3. Review the initial police report.
4. Establish Samuel's recent concerns.
5. Determine whether robbery explains the evidence.

Act conclusion:
Samuel was likely targeted because of his investigation.

## ACT 2: THE ALTERED MANIFEST

Target duration: 35–45 minutes.

New locations:
- Cargo verification office
- Equipment storage building
- Terminal security office
- Leonard's office

Objectives:
1. Recover Samuel's notebook.
2. Compare original and altered manifests.
3. Reconstruct suspicious cargo movements.
4. Investigate Leonard's involvement.
5. Identify Thomas's access to the scene.

Act conclusion:
The player establishes that shipping records were deliberately manipulated.

## ACT 3: THE ENFORCEMENT NETWORK

Target duration: 40–50 minutes.

New locations:
- Kane Logistics
- Bell Freight Security Yard
- Freight accounting office

Objectives:
1. Investigate Thomas's alibi.
2. Establish Victor's relationship with Thomas.
3. Trace suspicious payments.
4. Investigate Leonard's coercion.
5. Identify Meridian's involvement.

Act conclusion:
The player establishes a coordinated freight operation connected to Meridian.

## ACT 4: THE ARCHITECT'S SHADOW

Target duration: 40–45 minutes.

New location:
- Riverside Freight Transfer Yard

Objectives:
1. Reconstruct Samuel's murder.
2. Identify Thomas as the killer.
3. Establish Victor's role.
4. Complete the financial and freight deductions.
5. Recover the internal organization reference.
6. Discover the title "The Architect."
7. Submit the final case report.

Act conclusion:
Samuel's murder is solved, but the player discovers that the identified operators answer to a higher authority.

---

# 10. REACTIVE EVENTS

Implement eight authored reactive events.

## RE01: Elena Remembers the Notebook

Trigger:
Player establishes Samuel was investigating cargo records.

Effect:
Elena recalls Samuel mentioning a secure place for his notes.

## RE02: A Manifest Is Replaced

Trigger:
Player examines original shipping records.

Effect:
A revised manifest becomes available, creating a contradiction.

## RE03: Leonard Changes His Statement

Trigger:
Player identifies altered records.

Effect:
Leonard admits he approved irregular cargo movements but denies knowing their full purpose.

## RE04: Thomas Becomes Unavailable

Trigger:
Player establishes Thomas's false alibi.

Effect:
Thomas temporarily refuses further questioning.

New evidence later unlocks a follow-up.

Do not permanently lock critical dialogue.

## RE05: Victor Contacts Blackwood

Trigger:
Player begins investigating Kane Logistics.

Effect:
Victor offers a controlled explanation of the company's activities.

## RE06: Police Recover the Missing Phone

Trigger:
Player establishes Thomas's involvement and identifies the relevant search lead.

Effect:
Recovered phone evidence becomes available through law enforcement.

## RE07: The Freight Network Is Exposed

Trigger:
Player completes the core freight-operation deductions.

Effect:
Additional organizational records become available.

## RE08: The Architect Reference

Trigger:
Player completes D15 and discovers E039.

Effect:
E040 becomes available.

The notebook records the unidentified title.

Do not automatically pin the document to the wheeled board.

---

# 11. INTERVIEW SYSTEM

Reuse Blackwood's existing interview mechanics.

Initial question limit: 20 per character.

At approximately 15 questions, characters begin indicating that the conversation is ending.

At 20 questions, the interview concludes.

New evidence may unlock five-question follow-up interviews.

Preserve existing Standard and Hardcore question-credit behavior.

## Important character progression

Leonard:
- Initially dismissive.
- Defensive about altered manifests.
- Admits being pressured.
- Provides limited information about Victor.

Thomas:
- Initially claims an unrelated work assignment.
- Contradicted by access and vehicle evidence.
- Becomes evasive.
- Eventually implicated in the murder.

Victor:
- Initially professional and confident.
- Minimizes irregular cargo operations.
- Denies directing violence.
- Is implicated in intimidation and concealment.

Marcus:
- May be interviewed through an appropriate authorized channel.
- Acknowledges limited business relationships.
- Denies knowledge of Samuel's murder.
- Does not reveal the mastermind.

Adrian:
- May provide limited statements or records consistent with his status after The Ledger.
- Does not contradict previous case outcomes.
- Does not identify the mastermind.

All interviews must use character-specific knowledge boundaries.

Do not use generic dialogue that reveals the full solution.

---

# 12. SERIES BOARD INTEGRATION

The wheeled cork board persists from S01 C01 and S01 C02.

Players manually choose which new evidence to pin.

No automatic connections.

No automatic rearrangement.

No automatic conclusions.

## New series deduction S001-D002

Title: The Financial Network Supports Freight Operations

Required evidence:
S001-C01-E029
S001-C03-E038

Conclusion:
Financial relationships uncovered in The Ledger are connected to the freight operation.

## New series deduction S001-D003

Title: Meridian Operates Across Multiple Criminal Activities

Required evidence:
S001-C02-E035
S001-C03-E033
S001-C03-E037

Conclusion:
Meridian's intelligence operation helped facilitate criminal freight activity.

### Series deduction behavior

These deductions are optional for completing Dead Freight.

They persist across the series.

They require player-created evidence connections.

Do not complete them automatically when evidence is discovered.

Do not reveal the mastermind.

### Existing series deduction

Preserve:

S001-D001: The Financial and Intelligence Operations Are Connected

Do not reset it.

---

# 13. FINAL CASE REPORT

The player must identify:

Who murdered Samuel Ortiz?
Thomas Bell.

What was the murder weapon?
A heavy steel cargo-securing bar.

Why did Thomas confront Samuel?
To intimidate him and recover evidence of suspicious shipments.

Who directed the intimidation?
Victor Kane.

Did Victor explicitly order Samuel's murder?
No.

Who concealed the crime?
Thomas staged the scene, and Victor later helped conceal Thomas's involvement.

Why was Samuel targeted?
He was documenting irregular cargo movements.

What was Leonard Briggs's role?
He approved and concealed suspicious shipping activity under coercion.

How was Meridian involved?
Meridian-linked financial and intelligence operations supported the freight network.

Who is the Architect?
Unknown.

### Completion requirements

Require evidence-supported answers.

Allow incorrect reports to be revised.

Do not require optional series deductions to complete the case.

Do not identify Evelyn Voss.

---

# 14. ENDING SEQUENCE

After the final report, the player returns to Blackwood's office.

The current Murder Board contains the completed Samuel Ortiz investigation.

The wheeled board remains unchanged unless the player manually adds evidence.

A new notebook entry appears:

THE JUDAS PRINCIPLE

"Three investigations. Three different crimes.

Financial fraud. Blackmail. Murder.

The names change. The businesses change.

But the same connections keep appearing.

And now, for the first time, we've found a name for whoever is directing them.

The Architect."

Do not reveal the Architect's identity.

Mark S01 C03 complete.

Unlock S01 C04: The Informant.

Do not automatically start the next case.

---

# 15. MULTIPLAYER REQUIREMENTS

Support 1–6 players.

Synchronize:
- Evidence discoveries
- Completed deductions
- Interviews where applicable
- Reactive events
- Case progression
- Series board state
- Player-created yarn connections

Prevent duplicate events.

Preserve the board when players disconnect.

Do not overwrite shared series progress.

Players joining an existing session must see the current board state.

---

# 16. VISUAL DIRECTION

Baltimore, December 2018.

Use:
- Contemporary painted crime-drama illustrations
- Gouache and oil textures
- Visible brushwork
- Subtle film grain
- Rain-wet shipping terminals
- Cargo containers
- Industrial cranes
- Harbor fog
- Cold blue-gray lighting
- Warm sodium-orange industrial lights
- Realistic 2018 trucks and security equipment
- Industrial offices and freight records

No 1980s styling.

No supernatural elements.

No futuristic technology.

Keep the geography and cargo movement routes consistent.

---

# 17. IMPLEMENTATION ORDER

Phase 1: Audit existing series infrastructure and previous cases.

Phase 2: Verify wheeled board persistence and prior evidence references.

Phase 3: Implement Dead Freight case data and four-act structure.

Phase 4: Author all 40 evidence records.

Phase 5: Implement and validate 16 case deductions.

Phase 6: Build 13 locations.

Phase 7: Implement 11 interviewable characters.

Phase 8: Implement eight reactive events.

Phase 9: Implement the final murder reconstruction and report.

Phase 10: Implement two new series deductions.

Phase 11: Test solo, multiplayer, persistence, and alternative investigation orders.

---

# 18. ACCEPTANCE CRITERIA

Dead Freight is complete when:

1. S01 C03 appears under S001: The Judas Principle.
2. The wheeled board preserves all previous content.
3. The original Murder Board is prepared for the new case.
4. The case begins with new briefing paperwork.
5. All 13 locations are implemented.
6. All 11 interviewable characters have complete dialogue.
7. All 40 evidence items are discoverable.
8. All 16 case deductions function.
9. All eight reactive events function.
10. Samuel's murder can be reconstructed.
11. Thomas is correctly identified as the killer.
12. Victor's role is established without falsely claiming he ordered murder.
13. Leonard's coercion is explained.
14. Meridian's connection to the freight operation is established.
15. The title "The Architect" is discovered.
16. The mastermind's identity remains hidden.
17. Both new series deductions work.
18. Previous series deductions persist.
19. No cross-case connections are automatically completed.
20. Multiplayer progression is synchronized.
21. No critical softlocks exist.
22. No purchased interview questions are required.
23. Existing cases remain functional.
24. S01 C04 unlocks after completion.

---

# FINAL INSTRUCTION

Implement S01 C03: Dead Freight as the third investigation in The Judas Principle.

This case must solve Samuel Ortiz's murder while expanding the player's understanding of Meridian Advisory Group.

By the end, the player should recognize that Meridian's financial, intelligence, and freight operations are connected.

They should also discover that the people directing these operations appear to answer to someone called the Architect.

Do not identify that person.

Preserve all previous series evidence, player-created board connections, and multiplayer progress.

Audit the existing implementation first, then build the case using established Blackwood systems.