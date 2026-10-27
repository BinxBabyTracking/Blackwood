# BLACKWOOD INVESTIGATIONS
# SERIES S001: THE JUDAS PRINCIPLE
# CASE S01 C05: THE BENEFACTOR

## COMPLETE STORY BIBLE AND IMPLEMENTATION SPECIFICATION

You are implementing the fifth case of Blackwood Investigations' first six-case connected series, The Judas Principle.

This is the penultimate investigation and the point where the player can identify Dr. Evelyn Voss as the likely mastermind behind Meridian Advisory Group.

The player must not yet possess enough admissible, authenticated evidence to establish her criminal command responsibility.

This case must provide a complete, independently solvable murder mystery while advancing the series toward its finale.

Integrate this case into the existing Blackwood application.

Do not create a standalone game.

Before implementing, inspect the existing codebase, especially:

- S01 C01: The Ledger
- S01 C02: Room 614
- S01 C03: Dead Freight
- S01 C04: The Informant
- Series S001 progression
- Original Murder Board
- Persistent wheeled series cork board
- Notebook and evidence archives
- Interviews and follow-up questions
- Deduction validation
- Reactive events
- Multiplayer synchronization
- Save and resume behavior

Preserve existing functionality.

Do not implement S01 C06 yet.

---

# 1. CASE INFORMATION

Series ID: S001
Series title: The Judas Principle
Internal case ID: S001-C05
Player-facing ID: S01 C05
Case title: The Benefactor

Location: Manhattan, New York City
Date: December 20–22, 2018
Target duration: 180–210 minutes
Players: 1–6
Difficulty: Advanced
Genre: Murder mystery, financial conspiracy, psychological thriller

Case structure: Five acts
Primary locations: 15
Interviewable characters: 13
Evidence items: 48
Primary deductions: 19
Reactive events: 10
New series deductions: 4

## Case premise

Dr. Evelyn Voss is hosting the Voss Foundation's annual winter charity gala at the fictional Ashbourne Grand Hotel in Manhattan.

The event attracts philanthropists, business executives, political donors, financial advisers, and nonprofit leaders.

Among the invited guests is Nathaniel Brooks, a 57-year-old financial adviser who has been examining the foundation's investments and associated trust structures.

Nathaniel recently discovered unusual ownership relationships involving Meridian Advisory Group and several companies connected to the previous investigations.

He believes the foundation's financial structure conceals a much larger operation.

During the gala, Nathaniel is found dead in a private conference suite.

The room shows signs of a confrontation.

His briefcase is missing.

A glass of whiskey sits on the table.

Hotel security initially believes he suffered a medical emergency or died during a robbery.

A subsequent examination establishes that he was murdered.

Evelyn publicly expresses shock and asks Blackwood to assist with the investigation.

She presents herself as a concerned host who wants justice for Nathaniel.

The player must identify the killer, determine who arranged the confrontation, recover Nathaniel's research, and understand why he was targeted.

By the conclusion, Blackwood uncovers financial records linking Evelyn's charitable organization to the hidden ownership structure behind Meridian.

The player may identify Evelyn as the Architect.

However, the final evidence required to prove her command of the organization remains missing.

---

# 2. SERIES CONTINUITY

The following cases have already occurred:

S01 C01: The Ledger
S01 C02: Room 614
S01 C03: Dead Freight
S01 C04: The Informant

Previous investigations established:

- Adrian Cross operated fraudulent financial channels.
- Marcus Shaw directed intelligence and blackmail operations.
- Victor Kane coordinated criminal logistics and intimidation.
- Meridian Advisory Group connected these operations.
- An unidentified authority used the designation "A."
- An internal document referenced "The Architect."
- Claire Donovan discovered that Blackwood received genuine but selectively chosen information.
- Someone deliberately directed Blackwood toward specific Meridian executives.

## Starting state

When S01 C05 begins:

1. The original wall-mounted Murder Board is cleared for The Benefactor.
2. The wheeled series board retains its exact state.
3. All previously pinned evidence remains in place.
4. All player-created red-yarn connections remain unchanged.
5. All notes, labels, and evidence positions persist.
6. Previous series deductions remain saved.
7. The new case briefing appears on Blackwood's desk.
8. Previous case evidence remains accessible through the archives.
9. No evidence is automatically pinned.
10. No series deductions are automatically completed.

## Previous character continuity

Evelyn Voss has appeared in earlier cases.

Her behavior in The Benefactor must be consistent with those appearances.

Claire Donovan was rescued in The Informant.

Her testimony and established knowledge must remain consistent.

Adrian Cross, Marcus Shaw, and Victor Kane may be in custody, under investigation, or otherwise restricted.

Respect their previously established legal and narrative states.

Do not reset their circumstances for convenience.

---

# 3. CANONICAL TRUTH

AUTHOR-ONLY INFORMATION.

Do not expose this section through player-visible data, opening dialogue, case selection, or evidence descriptions before the appropriate discovery.

## The Voss Foundation

The Voss Foundation is a legitimate charitable organization founded by Dr. Evelyn Voss.

It supports education, community development, medical initiatives, and economic assistance programs.

Much of its public work is genuine.

However, Evelyn has used selected financial relationships and investment structures to conceal her control of a separate criminal network.

Not all foundation employees are involved.

Not all foundation transactions are fraudulent.

This distinction is essential.

## Evelyn's hidden organization

Evelyn controls a network operating through Meridian Advisory Group and associated companies.

Her principal operators have included:

- Adrian Cross: Financial operations
- Marcus Shaw: Intelligence and blackmail
- Victor Kane: Criminal logistics and intimidation
- Elena Ward: Legal concealment and political influence

Evelyn's philosophy is that information creates leverage, leverage creates dependency, and dependency creates control.

She rarely performs criminal acts herself.

Instead, she uses intermediaries, financial pressure, selective disclosures, and carefully structured relationships.

## Nathaniel Brooks's discovery

Nathaniel was a respected financial adviser retained to review investment structures associated with the Voss Foundation.

He began examining several trusts and holding companies that were not clearly described in the foundation's public materials.

Nathaniel discovered that some of these entities held interests in companies associated with Meridian Advisory Group.

He also found financial relationships connecting the foundation's investment structure to companies identified in earlier Blackwood investigations.

Nathaniel initially believed the discrepancies represented undisclosed conflicts of interest.

As he continued investigating, he realized that the structures might conceal operational control over Meridian.

He created a private research file.

He intended to confront Evelyn and request an independent investigation.

## Elena Ward's involvement

Elena Ward is a senior attorney and political influence specialist who has worked with Evelyn for years.

Elena helps maintain legal separation between the foundation, Meridian, and related entities.

She knows Evelyn exercises influence over the network.

She also knows Nathaniel's research could expose the hidden ownership structure.

Evelyn instructed Elena to stop Nathaniel's disclosure and recover his research.

Evelyn authorized a coercive intervention and knew that Nathaniel was being threatened.

The available evidence in this case does not conclusively establish that Evelyn ordered Nathaniel's murder or knew in advance that lethal violence would occur.

## The murder plan

Elena hired a private security operative named Gabriel Knox.

She instructed Gabriel to meet Nathaniel during the gala, pressure him into surrendering his documents, and prevent him from disclosing the ownership information.

Gabriel was told that Nathaniel possessed confidential documents belonging to the foundation.

Elena authorized intimidation and document recovery.

Gabriel arranged for Nathaniel to enter a private conference suite.

## The murder

At approximately 9:40 PM on December 20, Nathaniel entered the conference suite.

Gabriel confronted him.

Nathaniel refused to surrender his research.

During the confrontation, Gabriel struck Nathaniel with a heavy marble desk accessory.

Nathaniel collapsed and suffered a fatal head injury.

Gabriel searched Nathaniel's belongings and removed his briefcase.

He disturbed the room to suggest a robbery.

He left through a staff-access corridor.

## After the murder

Gabriel contacted Elena.

Elena learned Nathaniel was dead.

She arranged a payment through a security consulting intermediary.

She also instructed foundation personnel to preserve a public appearance of cooperation while quietly restricting access to certain financial records.

Elena's post-murder conduct establishes her involvement in concealing the crime.

## Evelyn's response

Evelyn learned of Nathaniel's death.

She recognized that the murder threatened to expose the hidden financial structure.

She publicly cooperated with Blackwood.

She privately directed Elena to contain the legal and reputational consequences.

Evelyn did not expect Blackwood to recover the complete ownership trail.

However, her earlier strategy of selectively exposing subordinates has made the organization increasingly unstable.

## The hidden ownership structure

Nathaniel's research identifies a network of trusts and holding companies.

These entities are connected through:
- Investment agreements
- Beneficial ownership records
- Trustee correspondence
- Management authorizations
- Financial transfers
- Corporate control rights

The evidence supports the conclusion that Evelyn has substantial concealed influence over Meridian's ownership structure.

However, concealed financial influence alone does not prove she ordered the earlier crimes.

## The larger revelation

The player can connect:

- Evelyn's early cooperation in The Ledger.
- Claire's selective disclosure records from The Informant.
- The unidentified superior referenced as "A."
- The Architect designation.
- Nathaniel's ownership research.
- Evelyn's connection to the foundation and related trusts.

Together, these support a strong theory that Evelyn is the Architect.

But the final proof of direct criminal authority is still missing.

That proof becomes the central objective of S01 C06.

---

# 4. VICTIM

## CH01: Nathaniel Brooks

Age: 57
Occupation: Financial adviser
Residence: New York City
Marital status: Married
Children: Two adult children

### Personality

Analytical, principled, cautious, and persistent.

Nathaniel believed financial structures should be transparent when charitable assets and public trust were involved.

### Relevant relationships

- Evelyn Voss: Foundation founder and client
- Elena Ward: Foundation legal adviser
- Gabriel Knox: Security operative who confronted him
- Margaret Brooks: Wife
- Simon Hale: Junior financial analyst
- Richard Bellamy: Foundation chief financial officer

### Cause of death

Fatal blunt-force head injury.

Murder weapon: Heavy marble desk accessory.

Death occurred during the gala on December 20, 2018.

---

# 5. INTERVIEWABLE CHARACTERS

Implement 13 interviewable characters.

Each requires:
- Stable ID
- Name
- Age
- Occupation
- Portrait
- Biography
- Personality
- Knowledge boundaries
- Initial interview
- Evidence-dependent responses
- Contradictions
- Follow-up conditions
- Availability states
- Final case state

## CH02: Evelyn Voss

Age: 52
Occupation: Philanthropist and founder of the Voss Foundation
Role: Hidden mastermind

Evelyn hosts the gala.

She publicly cooperates with Blackwood.

She expresses concern about Nathaniel's death.

She acknowledges legitimate relationships between the foundation and Meridian.

She denies directing criminal activities.

Her statements should be controlled, intelligent, and carefully worded.

She must not confess.

She must not reveal the entire criminal network.

She should become more guarded as the investigation progresses.

By the end, she may recognize that Blackwood suspects her.

## CH03: Elena Ward

Age: 50
Occupation: Attorney and political influence consultant
Role: Organizer of Nathaniel's coercive confrontation

Elena arranged Gabriel's meeting with Nathaniel.

She authorized intimidation and recovery of documents.

She concealed the incident after learning Nathaniel was dead.

She initially claims Gabriel was providing routine security services.

She becomes defensive when confronted with payment and communication records.

She knows Evelyn has influence over the network.

She does not voluntarily disclose the complete hierarchy.

## CH04: Gabriel Knox

Age: 41
Occupation: Private security operative
Role: Actual murderer

Gabriel confronted Nathaniel in the conference suite.

He killed Nathaniel during the confrontation.

He stole Nathaniel's briefcase.

He staged the scene.

He initially claims he was assigned to an unrelated security task.

His alibi conflicts with hotel access and surveillance records.

## CH05: Margaret Brooks

Age: 55
Occupation: Museum administrator
Role: Nathaniel's wife

Margaret knows Nathaniel had become concerned about the foundation's finances.

She recalls him mentioning hidden ownership arrangements.

She is innocent.

She provides background and personal correspondence.

## CH06: Simon Hale

Age: 29
Occupation: Junior financial analyst

Simon assisted Nathaniel with financial research.

He knows Nathaniel was examining trust structures.

He possesses partial copies of research documents.

He initially fears professional retaliation.

He is innocent.

## CH07: Richard Bellamy

Age: 58
Occupation: Foundation chief financial officer

Richard oversees legitimate foundation finances.

He knows some investment structures were unusually complex.

He approved transactions based on legal assurances from Elena.

He is not involved in the murder.

He may be professionally negligent.

## CH08: Victoria Lane

Age: 45
Occupation: Gala event director

Victoria coordinated the gala.

She knows the event schedule and private room assignments.

She noticed changes to Nathaniel's meeting arrangements.

She is innocent.

## CH09: James Porter

Age: 38
Occupation: Hotel security supervisor

James manages hotel access and surveillance.

He initially believes Gabriel's presence was authorized.

He later identifies discrepancies in security assignments.

He is innocent.

## CH10: Olivia Reed

Age: 32
Occupation: Gala server

Olivia saw Nathaniel enter the conference corridor.

She noticed Gabriel leaving later with a briefcase.

She initially fears losing her job.

She is innocent.

## CH11: Daniel Whitmore

Age: 47
Occupation: Investment attorney

Daniel has experience with trusts and beneficial ownership.

He can explain the significance of Nathaniel's research.

He is not involved in the murder.

He must distinguish financial control from proof of criminal command.

## CH12: Detective Anthony Russo

Age: 49
Occupation: NYPD homicide detective

Anthony leads the murder investigation.

He provides forensic findings and coordinates lawful evidence recovery.

He is not corrupt.

He becomes increasingly concerned about the wider conspiracy.

## CH13: Claire Donovan

Age: 34
Occupation: Former Meridian records analyst

Claire was rescued in The Informant.

She can compare Nathaniel's discoveries with the internal records she previously collected.

She knows Evelyn as a philanthropic contact but does not initially understand her criminal role.

As evidence accumulates, Claire recognizes the possibility that Evelyn deliberately manipulated her.

Claire must not suddenly know information she never encountered.

---

# 6. LOCATIONS

Implement 15 primary locations.

## L01: Blackwood Office

Existing office hub.

Contains:
- New case briefing
- Notebook
- Current Murder Board
- Persistent wheeled series board
- Telephone
- Travel access

## L02: Ashbourne Grand Hotel Lobby

Contains:
- Guest records
- Event signage
- Staff interviews
- Security information

## L03: Gala Ballroom

Contains:
- Guest tables
- Stage
- Charity displays
- Witnesses
- Event timeline evidence

## L04: Private Conference Suite

Primary murder scene.

Contains:
- Nathaniel's body location
- Missing desk accessory location
- Disturbed furniture
- Whiskey glass
- Physical evidence
- Meeting documents

## L05: Conference Corridor

Contains:
- Security camera coverage
- Access records
- Witness observations
- Staff-only passage

## L06: Hotel Security Office

Contains:
- Surveillance footage
- Access logs
- Security assignments
- Incident reports

## L07: Hotel Service Corridor

Contains:
- Staff access route
- Exit records
- Evidence of Gabriel's movements

## L08: Voss Foundation Headquarters

Contains:
- Foundation records
- Investment files
- Executive offices
- Financial documentation

## L09: Nathaniel Brooks's Office

Contains:
- Research notes
- Financial models
- Client correspondence
- Hidden backup documents

## L10: Brooks Family Residence

Contains:
- Personal correspondence
- Nathaniel's recent concerns
- Margaret Brooks

## L11: Elena Ward's Law Office

Contains:
- Legal agreements
- Trust correspondence
- Security contracts
- Relevant communications

## L12: Gabriel Knox Security Office

Contains:
- Work schedules
- Payment records
- Equipment records
- Relevant communications

## L13: Financial Records Archive

Contains:
- Trust documents
- Beneficial ownership records
- Corporate registrations
- Investment agreements

## L14: Private Investment Office

Contains:
- Holding company records
- Management authorizations
- Financial transfers
- Corporate control evidence

## L15: NYPD Homicide Division

Contains:
- Police reports
- Forensic updates
- Detective Russo
- Authorized interviews

### Location requirements

Every location must include:
- Original painted artwork
- Interactive hotspots
- Evidence placements
- Unlock conditions
- Relevant characters
- Return-visit states
- Notebook integration
- Murder Board integration

Allow reasonable investigative flexibility.

---

# 7. EVIDENCE MANIFEST

Implement exactly 48 canonical evidence records.

Use globally unique identifiers.

Example:

S001-C05-E001

Every item requires:
- Full player-visible content
- Provenance
- Discovery location
- Unlock conditions
- Related characters
- Related deductions
- Notebook entry
- Asset requirements
- Critical or supporting classification

## Group A: Murder Scene

E001: Initial Police Report
Documents Nathaniel's death and initial circumstances.

E002: Conference Suite Photographs
Shows the scene and disturbed furniture.

E003: Medical Examiner Summary
Establishes fatal blunt-force trauma.

E004: Missing Marble Desk Accessory
Identifies the likely weapon.

E005: Whiskey Glass Examination
Shows the glass was present but does not independently establish poisoning.

E006: Conference Room Booking
Shows Nathaniel's private meeting.

E007: Hotel Access Log
Documents access during the relevant period.

E008: Corridor Surveillance Record
Shows movements near the conference suite.

E009: Service Corridor Record
Documents the likely exit route.

E010: Missing Briefcase Report
Establishes that Nathaniel's research materials were taken.

## Group B: Nathaniel's Investigation

E011: Nathaniel's Research Notes
Documents concerns about hidden ownership.

E012: Trust Structure Diagram
Shows relationships between trusts and holding companies.

E013: Beneficial Ownership Record
Identifies relevant ownership interests.

E014: Investment Agreement
Documents financial relationships.

E015: Foundation Financial Statement
Shows legitimate and unusual investment activity.

E016: Meridian Corporate Registration
Documents Meridian's formal ownership structure.

E017: Holding Company Register
Connects intermediary entities.

E018: Trustee Correspondence
Shows instructions concerning management and control.

E019: Nathaniel's Private Memorandum
Explains why he believed the ownership structure required investigation.

E020: Research Backup Copy
Contains selected records Nathaniel preserved separately.

## Group C: Suspect Evidence

E021: Gabriel Knox Security Assignment
Shows his official duties.

E022: Gabriel Knox Access Credential
Establishes his ability to enter restricted areas.

E023: Gabriel Knox Work Schedule
Conflicts with his initial alibi.

E024: Gabriel Knox Vehicle Record
Connects him to a relevant exit route.

E025: Gabriel Knox Financial Statement
Shows a suspicious payment.

E026: Elena Ward Communication Record
Shows contact with Gabriel.

E027: Elena Ward Security Contract
Documents the arrangement.

E028: Post-Murder Payment Record
Shows payment through an intermediary.

E029: Olivia Reed Witness Statement
Places Gabriel near the conference suite.

E030: James Porter Security Report
Documents irregularities in Gabriel's assignment.

E031: Recovered Briefcase
Contains materials taken from Nathaniel.

E032: Recovered Murder Weapon
Physical evidence supporting the murder reconstruction.

## Group D: Foundation Connections

E033: Voss Foundation Investment Register
Shows foundation-related investment structures.

E034: Meridian Advisory Group Financial Link
Connects Meridian to related entities.

E035: Foundation Trustee Authorization
Shows unusual management rights.

E036: Elena Ward Legal Memorandum
Explains the claimed legitimacy of the structure.

E037: Richard Bellamy Statement
Describes foundation financial procedures.

E038: Simon Hale Research Summary
Explains Nathaniel's findings.

E039: Corporate Control Agreement
Shows how influence was exercised through intermediaries.

E040: Evelyn Voss Correspondence
Shows Evelyn's involvement in relevant financial decisions.

## Group E: Series Revelations

E041: Meridian Ownership Cross-Reference
Connects the foundation's structures to Meridian.

E042: Historical Financial Relationship
Shows relationships predating the earlier investigations.

E043: Executive Exposure Comparison
Connects the targeted Meridian executives to internal financial concerns.

E044: Claire Donovan Comparison Notes
Relates Nathaniel's research to Claire's earlier disclosures.

E045: Unidentified Authority Communication
Contains another partial reference to the superior authority.

E046: Architect Designation Cross-Reference
Connects the designation to high-level organizational instructions.

E047: Voss Foundation Control Summary
Shows Evelyn's concealed influence over related entities.

E048: Nathaniel's Final Research Conclusion
States that Evelyn may be exercising control over Meridian through intermediary structures.

### Evidence restrictions

E048 may establish a credible theory of Evelyn's control.

It must not independently prove that Evelyn ordered the earlier crimes.

E045 and E046 must not contain a complete authenticated command chain.

The missing proof is reserved for S01 C06.

### Authoring requirements

Expand every evidence item into a complete, specific player-visible record.

Do not use these descriptions as finished content.

Ensure all records have plausible provenance and acquisition methods.

Use legally and financially coherent explanations.

Do not portray a charitable foundation's ownership of investments as inherently criminal.

---

# 8. PRIMARY CASE DEDUCTIONS

Implement 19 primary deductions.

## D01: Nathaniel Was Murdered

Required:
E002 + E003

Conclusion:
Nathaniel died from an inflicted injury rather than a natural medical event.

## D02: The Scene Was Disturbed

Required:
E002 + E010

Conclusion:
Someone searched Nathaniel's belongings and removed his briefcase.

## D03: Nathaniel Attended a Private Meeting

Required:
E006 + E007

Conclusion:
Nathaniel entered the conference suite for a scheduled encounter.

## D04: Gabriel Had Access

Required:
E021 + E022

Conclusion:
Gabriel could enter the relevant restricted area.

## D05: Gabriel's Alibi Was False

Required:
E023 + E008

Conclusion:
Gabriel's movements conflict with his account.

## D06: Gabriel Was Seen With the Briefcase

Required:
E029 + E010

Conclusion:
A witness places Gabriel leaving the area with a briefcase matching Nathaniel's.

## D07: Gabriel Killed Nathaniel

Required:
D01 + D04 + D05 + D06 + E032

Conclusion:
The combined evidence supports Gabriel as Nathaniel's murderer.

## D08: Elena Arranged the Confrontation

Required:
E026 + E027

Conclusion:
Elena arranged Gabriel's involvement.

## D09: Elena Concealed the Crime

Required:
E025 + E028 + E030

Conclusion:
Elena's operation arranged suspicious payment activity and concealed Gabriel's involvement after the murder.

## D10: Nathaniel Was Investigating Ownership

Required:
E011 + E019

Conclusion:
Nathaniel was examining concealed financial control.

## D11: The Trust Structure Was Complex

Required:
E012 + E017

Conclusion:
Multiple entities separated formal ownership from effective influence.

## D12: Meridian Was Connected to the Structure

Required:
E013 + E016 + E034

Conclusion:
Meridian was financially connected to the entities Nathaniel investigated.

## D13: The Foundation Had Related Investments

Required:
E014 + E033

Conclusion:
Foundation-associated investment structures held interests in related companies.

## D14: Evelyn Exercised Financial Influence

Required:
E035 + E039 + E040

Conclusion:
Evelyn exercised significant influence over relevant financial arrangements.

## D15: Nathaniel Was Targeted for His Research

Required:
D02 + D08 + D10

Conclusion:
The confrontation was intended to recover or suppress Nathaniel's findings.

## D16: The Foundation and Meridian Shared Hidden Relationships

Required:
D12 + D13 + E041

Conclusion:
The two organizations were connected through intermediary ownership structures.

## D17: The Relationships Predated the Crimes

Required:
E042 + E043

Conclusion:
The financial relationships existed before the recent investigations.

## D18: Evelyn Is a Credible Candidate for the Architect

Required:
D14 + D16 + E045 + E046 + E047

Conclusion:
The evidence supports a strong theory that Evelyn may be the authority directing Meridian.

This is a theory, not a proven criminal command finding.

## D19: Nathaniel's Murder Was Part of a Concealment Effort

Required:
D07 + D08 + D09 + D15

Conclusion:
Nathaniel was murdered during an operation intended to suppress disclosure of the ownership structure.

### Deduction restrictions

Do not create circular dependencies.

Do not allow D18 to be treated as proof of criminal guilt.

Do not make Evelyn's foundation automatically criminal.

Do not falsely establish that Evelyn directly ordered Nathaniel's murder.

Distinguish:
- Gabriel's act of murder.
- Elena's organization of the confrontation and concealment.
- Evelyn's financial influence and involvement in suppressing disclosure.
- The still-unproven question of Evelyn's direct criminal command.

---

# 9. FIVE-ACT STRUCTURE

## ACT 1: THE GALA

Target duration: 30–35 minutes.

Available:
- Blackwood office
- Hotel lobby
- Gala ballroom
- Conference suite
- Police contact

Objectives:
1. Examine the murder scene.
2. Interview gala attendees.
3. Establish Nathaniel's final movements.
4. Determine whether robbery explains the evidence.
5. Identify the private meeting.

Act conclusion:
Nathaniel was targeted during a planned encounter.

## ACT 2: THE PRIVATE MEETING

Target duration: 35–40 minutes.

New locations:
- Conference corridor
- Hotel security office
- Service corridor
- Gabriel's security office

Objectives:
1. Reconstruct the meeting.
2. Examine hotel access records.
3. Investigate Gabriel.
4. Establish his false alibi.
5. Recover evidence connecting him to the briefcase.

Act conclusion:
Gabriel becomes the primary murder suspect.

## ACT 3: THE HIDDEN ACCOUNTS

Target duration: 40–45 minutes.

New locations:
- Nathaniel's office
- Brooks residence
- Foundation headquarters
- Financial records archive

Objectives:
1. Recover Nathaniel's research.
2. Examine trust structures.
3. Identify Meridian connections.
4. Establish Nathaniel's motive for investigating.
5. Determine why his research was dangerous.

Act conclusion:
The foundation and Meridian share hidden financial relationships.

## ACT 4: THE BENEFACTOR

Target duration: 40–45 minutes.

New locations:
- Elena's law office
- Private investment office

Objectives:
1. Investigate Elena's involvement.
2. Establish the coercive operation.
3. Examine post-murder concealment.
4. Identify Evelyn's financial influence.
5. Compare Nathaniel's research with previous series evidence.

Act conclusion:
Evelyn emerges as a credible candidate for the Architect.

## ACT 5: THE UNPROVEN TRUTH

Target duration: 35–45 minutes.

Objectives:
1. Reconstruct Nathaniel's murder.
2. Establish Gabriel's responsibility.
3. Establish Elena's role.
4. Recover the final ownership records.
5. Complete the case deductions.
6. Assemble the series-level theory.
7. Submit the final case report.

Act conclusion:
The murder is solved.

The player has a strong theory about Evelyn but lacks the final proof required to establish her command of the organization.

---

# 10. REACTIVE EVENTS

Implement 10 authored reactive events.

## RE01: The Gala Is Interrupted

Trigger:
Opening murder investigation.

Effect:
Guests react to Nathaniel's death.

Witness availability changes.

## RE02: The Missing Briefcase

Trigger:
Player examines the conference suite.

Effect:
Margaret reveals Nathaniel carried important research.

## RE03: Gabriel's Assignment Changes

Trigger:
Player examines security records.

Effect:
A discrepancy appears in the official assignment history.

## RE04: Evelyn Offers Cooperation

Trigger:
Player begins investigating foundation finances.

Effect:
Evelyn provides limited legitimate records.

She appears helpful.

## RE05: Simon Becomes Concerned

Trigger:
Player discovers Nathaniel's research.

Effect:
Simon provides additional documents after initially hesitating.

## RE06: Elena Restricts Access

Trigger:
Player identifies unusual trust relationships.

Effect:
Elena attempts to restrict disclosure of certain records.

The player must use a legitimate alternative route to obtain them.

Do not create a permanent softlock.

## RE07: Gabriel Attempts to Leave

Trigger:
Player establishes his false alibi.

Effect:
Police are alerted to his attempted departure.

No real-time countdown.

No unavoidable failure.

## RE08: The Briefcase Is Recovered

Trigger:
Player establishes Gabriel's connection to the missing documents.

Effect:
The briefcase becomes available through authorized evidence recovery.

## RE09: Claire Recognizes the Pattern

Trigger:
Player compares Nathaniel's research with earlier series records.

Effect:
Claire becomes available for a new interview.

She begins suspecting the philanthropic contact was involved in the manipulation.

## RE10: The Benefactor Revelation

Trigger:
Player completes D18.

Effect:
The notebook records Evelyn as a credible candidate for the Architect.

Do not automatically pin evidence or connect yarn.

---

# 11. INTERVIEW SYSTEM

Reuse Blackwood's established interview mechanics.

Initial question limit: 20 per character.

At approximately 15 questions, characters begin indicating the interview is ending.

At 20 questions, the interview concludes.

New evidence may unlock five-question follow-up interviews.

Preserve Standard and Hardcore credit mechanics.

## Critical interview progression

Evelyn:
- Initially warm and cooperative.
- Expresses concern about Nathaniel.
- Acknowledges legitimate financial relationships.
- Becomes guarded when confronted with hidden control records.
- Denies directing criminal activity.
- Does not confess.
- Does not reveal the complete organization.

Elena:
- Initially describes Gabriel as legitimate security.
- Minimizes Nathaniel's concerns.
- Becomes defensive about financial records.
- Is implicated in the coercive operation and concealment.

Gabriel:
- Initially claims routine security duties.
- Contradicted by access records.
- Contradicted by witness statements.
- Implicated in the murder.

Claire:
- Initially views Evelyn as a helpful contact.
- Recognizes similarities between Nathaniel's research and Meridian records.
- Begins questioning Evelyn's earlier involvement.
- Does not possess definitive proof of Evelyn's command.

All dialogue must respect character knowledge boundaries.

Do not let broad questions reveal the complete solution.

---

# 12. SERIES BOARD INTEGRATION

The wheeled cork board remains the persistent physical record of The Judas Principle.

It must retain all prior evidence, notes, positions, and yarn connections.

Players may manually pin any discovered evidence from The Benefactor.

Suggested series-relevant items:

E012: Trust Structure Diagram
E013: Beneficial Ownership Record
E017: Holding Company Register
E018: Trustee Correspondence
E033: Voss Foundation Investment Register
E034: Meridian Advisory Group Financial Link
E035: Foundation Trustee Authorization
E039: Corporate Control Agreement
E040: Evelyn Voss Correspondence
E041: Meridian Ownership Cross-Reference
E042: Historical Financial Relationship
E043: Executive Exposure Comparison
E044: Claire Donovan Comparison Notes
E045: Unidentified Authority Communication
E046: Architect Designation Cross-Reference
E047: Voss Foundation Control Summary
E048: Nathaniel's Final Research Conclusion

Do not automatically pin these items.

## New series deduction S001-D007

Title: The Foundation and Meridian Are Financially Connected

Required evidence:
S001-C05-E033
S001-C05-E034
S001-C05-E041

Conclusion:
The Voss Foundation's investment structure is connected to Meridian through intermediary entities.

## New series deduction S001-D008

Title: Evelyn Exercises Concealed Influence

Required evidence:
S001-C05-E035
S001-C05-E039
S001-C05-E040

Conclusion:
Evelyn has substantial influence over entities associated with Meridian.

## New series deduction S001-D009

Title: The Exposure Campaign Benefited Evelyn

Required:
S001-D005
S001-C05-E043
S001-C05-E044

Conclusion:
The selective exposure of Meridian executives reduced risks to an organization over which Evelyn exercised influence.

This establishes motive and benefit, not proof that she directed the disclosures.

## New series deduction S001-D010

Title: Evelyn May Be the Architect

Required:
S001-D006
S001-D007
S001-D008
S001-D009
S001-C05-E046

Conclusion:
The combined evidence supports Evelyn as the leading candidate for the Architect.

This deduction must be labeled as a working theory.

It is not a completed accusation.

### Series deduction behavior

These deductions belong to S001.

They persist into S01 C06.

They require player-created evidence connections.

Do not automatically solve them.

Do not require all previous optional series deductions to complete The Benefactor.

---

# 13. FINAL CASE REPORT

The player must identify:

Who murdered Nathaniel Brooks?
Gabriel Knox.

What was the murder weapon?
A heavy marble desk accessory.

Why was Nathaniel targeted?
He was investigating hidden ownership relationships involving the Voss Foundation and Meridian.

Who arranged the confrontation?
Elena Ward.

Did Elena explicitly order murder?
No. She arranged coercion and document recovery, then helped conceal the killing.

What was stolen?
Nathaniel's briefcase containing financial research.

What did Nathaniel discover?
Hidden ownership and control relationships linking foundation-associated entities to Meridian.

Was Evelyn financially connected to these entities?
Yes.

Does this establish that Evelyn ordered the murder?
No.

Is Evelyn a credible candidate for the Architect?
Yes.

Has her criminal command responsibility been conclusively established?
No.

### Completion requirements

Require evidence-supported answers.

Allow incorrect submissions to be revised.

Do not require optional series deductions.

Do not treat the player's suspicion of Evelyn as a criminal conviction.

---

# 14. ENDING SEQUENCE

After the final report, the player returns to Blackwood's office.

The original Murder Board contains the completed investigation.

The wheeled board remains available.

A new series notebook entry appears:

THE JUDAS PRINCIPLE

"We followed the money.

We found the people collecting secrets.

We found the people willing to kill to protect the operation.

Then we discovered someone had been feeding us the evidence.

Now we know who stood to benefit.

Dr. Evelyn Voss.

The woman who helped us begin this investigation.

The woman who stood beside us while we exposed everyone around her.

We can see the structure.

We can see her influence.

But influence isn't proof of murder.

If we're going to bring her down, we need more than a theory."

The notebook identifies Evelyn as the leading suspect.

Do not automatically add her portrait to the wheeled board.

The player must choose whether to pin it.

Mark S01 C05 complete.

Unlock S01 C06: The Architect.

Do not automatically begin the finale.

---

# 15. MULTIPLAYER REQUIREMENTS

Support 1–6 players.

Synchronize:
- Evidence discoveries
- Deductions
- Interview states
- Reactive events
- Case progression
- Series board state
- Player-created yarn connections
- Series deductions

Prevent duplicate events.

Preserve progress when players disconnect.

Do not overwrite an existing board.

Players joining later must see the current shared state.

---

# 16. VISUAL DIRECTION

Manhattan, December 2018.

Use:
- Contemporary painted crime-drama illustrations
- Gouache and oil textures
- Visible brushwork
- Subtle film grain
- Elegant charity gala interiors
- Chandeliers and warm amber lighting
- Cold winter city exteriors
- Dark financial offices
- Expensive hotel corridors
- Polished wood and marble
- Charcoal, burgundy, gold, slate, and cream
- Realistic 2018 phones, computers, and vehicles

No 1980s styling.

No supernatural elements.

No futuristic technology.

The gala should feel luxurious but grounded.

---

# 17. IMPLEMENTATION ORDER

Phase 1: Audit existing series infrastructure.

Phase 2: Verify prior case continuity and wheeled board persistence.

Phase 3: Implement The Benefactor case record and five-act structure.

Phase 4: Author all 48 evidence records.

Phase 5: Implement 19 case deductions.

Phase 6: Build 15 locations.

Phase 7: Implement 13 interviewable characters.

Phase 8: Implement 10 reactive events.

Phase 9: Implement the murder reconstruction.

Phase 10: Implement the ownership investigation.

Phase 11: Implement four new series deductions.

Phase 12: Implement final report and ending.

Phase 13: Test solo, multiplayer, persistence, alternative investigation orders, and softlock prevention.

---

# 18. ACCEPTANCE CRITERIA

The Benefactor is complete when:

1. S01 C05 appears under S001: The Judas Principle.
2. All prior wheeled board content persists.
3. The original Murder Board is prepared for the new case.
4. The new briefing is available.
5. All 15 locations are implemented.
6. All 13 characters have complete interviews.
7. All 48 evidence items are discoverable.
8. All 19 deductions function.
9. All 10 reactive events function.
10. Nathaniel's murder can be reconstructed.
11. Gabriel is identified as the killer.
12. Elena's role is established accurately.
13. The hidden ownership structure is discoverable.
14. Evelyn's financial influence is established.
15. Evelyn can be identified as a credible candidate for the Architect.
16. The case does not falsely prove Evelyn ordered murder.
17. Four new series deductions function.
18. All previous series deductions persist.
19. No evidence is automatically pinned or connected.
20. Multiplayer synchronization works.
21. No critical softlocks exist.
22. No purchased interview questions are required.
23. Existing cases remain functional.
24. S01 C06 unlocks after completion.

---

# FINAL INSTRUCTION

Implement S01 C05: The Benefactor as the penultimate investigation in The Judas Principle.

This case must solve Nathaniel Brooks's murder while revealing the financial structure that connects Dr. Evelyn Voss to Meridian Advisory Group.

By the end, players should strongly suspect Evelyn is the Architect.

However, they must understand that suspicion, financial influence, and motive are not sufficient to establish criminal command responsibility.

The final proof belongs in S01 C06.

Preserve the complete persistent wheeled series board and all player-created evidence connections.

Audit the existing implementation before making changes.

Implement the case using established Blackwood systems without disrupting previous cases.