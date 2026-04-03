export interface EndorsementItem {
  code: string;
  label: string;
}

export interface EndorsementCategory {
  title: string;
  items: EndorsementItem[];
}

export const ENDORSEMENT_CATEGORIES: EndorsementCategory[] = [
  {
    title: 'Prerequisites for the Practical Test Endorsement',
    items: [
      { code: 'A.1', label: 'Prerequisites for practical test: 14 CFR § 61.39(a)(6)(i) and (ii)' },
      { code: 'A.2', label: 'Review of deficiencies identified on airman knowledge test: § 61.39(a)(6)(iii), as required' },
    ],
  },
  {
    title: 'Student Pilot Endorsements',
    items: [
      { code: 'A.3', label: 'Pre-solo aeronautical knowledge: § 61.87(b)' },
      { code: 'A.4', label: 'Pre-solo flight training: § 61.87(c)(1) and (2)' },
      { code: 'A.5', label: 'Pre-solo flight training at night: § 61.87(o)' },
      { code: 'A.6', label: 'Solo flight (first 90 calendar-day period): § 61.87(n)' },
      { code: 'A.7', label: 'Solo flight (each additional 90 calendar-day period): § 61.87(p)' },
      { code: 'A.8', label: 'Solo takeoffs and landings at another airport within 25 NM: § 61.93(b)(1)' },
      { code: 'A.9', label: 'Solo cross-country flight: § 61.93(c)(1) and (2)' },
      { code: 'A.10', label: 'Solo cross-country flight: § 61.93(c)(3)' },
      { code: 'A.11', label: 'Repeated solo cross-country flights not more than 50 NM from the point of departure: § 61.93(b)(2)' },
      { code: 'A.12', label: 'Solo flight in Class B airspace: § 61.95(a)' },
      { code: 'A.13', label: 'Solo flight to, from, or at an airport located in Class B airspace: § 61.95(b) and § 91.131(b)(1)' },
      { code: 'A.14', label: 'Endorsement of U.S. citizenship recommended by the TSA: 49 CFR § 1552.3(h)' },
    ],
  },
  {
    title: 'Additional Student Pilot Endorsements for Students Seeking Sport or Recreational Pilot Certificates',
    items: [
      { code: 'A.15', label: 'Solo flight in Class B, C, and D airspace: § 61.94(a)' },
      { code: 'A.16', label: 'Solo flight to, from, or at an airport located in Class B, C, or D airspace or at an airport having an operational control tower: §§ 61.94(a) and 91.131(b)(1)' },
    ],
  },
  {
    title: 'Sport Pilot Endorsements',
    items: [
      { code: 'A.17', label: 'Aeronautical knowledge test: §§ 61.35(a)(1) and 61.309' },
      { code: 'A.18', label: 'Taking flight proficiency check for different category or class of aircraft: §§ 61.309 and 61.311' },
      { code: 'A.19', label: 'Passing flight proficiency check for different category or class of aircraft: §§ 61.309 and 61.311' },
      { code: 'A.20', label: 'Taking sport pilot practical test: §§ 61.309, 61.311, and 61.313' },
      { code: 'A.21', label: 'Passing a sport pilot practical test: §§ 61.309, 61.311, and 61.313' },
      { code: 'A.22', label: 'Class B, C, or D airspace, at an airport located in Class B, C, or D airspace, or to, from, through, or at an airport having an operational control tower: § 61.325' },
      { code: 'A.23', label: 'Light-sport aircraft with VH ≤ 87 KCAS: § 61.327' },
      { code: 'A.24', label: 'Light-sport aircraft with VH > 87 KCAS: § 61.327' },
    ],
  },
  {
    title: 'Recreational Pilot Endorsements',
    items: [
      { code: 'A.25', label: 'Aeronautical knowledge test: §§ 61.35(a)(1), 61.96(b)(3), and 61.97(b)' },
      { code: 'A.26', label: 'Flight proficiency/practical test: §§ 61.96(b)(5), 61.98(a) and (b), and 61.99' },
      { code: 'A.27', label: 'Recreational pilot to operate within 50 NM of the airport where training was received: § 61.101(b)' },
      { code: 'A.28', label: 'Recreational pilot to act as PIC on a flight that exceeds 50 NM of the departure airport: § 61.101(c)' },
      { code: 'A.29', label: 'Recreational pilot with less than 400 flight hours and no logged PIC time within the preceding 180 days: § 61.101(g)' },
      { code: 'A.30', label: 'Recreational pilot to conduct solo flights for the purpose of obtaining an additional certificate or rating while under the supervision of an authorized flight instructor: § 61.101(j)' },
      { code: 'A.31', label: 'Class B, C, or D airspace, at an airport located in Class B, C, or D airspace, or to, from, through, or at an airport having an operational control tower: § 61.101(d)' },
    ],
  },
  {
    title: 'Private Pilot Endorsements',
    items: [
      { code: 'A.32', label: 'Aeronautical knowledge test: §§ 61.35(a)(1), 61.103(d), and 61.105' },
      { code: 'A.33', label: 'Flight proficiency/practical test: §§ 61.103(f), 61.107(b), and 61.109' },
    ],
  },
  {
    title: 'Commercial Pilot Endorsements',
    items: [
      { code: 'A.34', label: 'Aeronautical knowledge test: §§ 61.35(a)(1), 61.123(c), and 61.125' },
      { code: 'A.35', label: 'Flight proficiency/practical test: §§ 61.123(e), 61.127, and 61.129' },
    ],
  },
  {
    title: 'Airline Transport Pilot (ATP) Endorsements',
    items: [
      { code: 'A.36', label: 'Restricted privileges ATP Certificate, Airplane Multiengine Land (AMEL) rating: § 61.160' },
      { code: 'A.37', label: 'ATP Certification Training Program (CTP): § 61.153(e)' },
    ],
  },
  {
    title: 'Instrument Rating Endorsements',
    items: [
      { code: 'A.38', label: 'Aeronautical knowledge test: §§ 61.35(a)(1) and 61.65(a) and (b)' },
      { code: 'A.39', label: 'Flight proficiency/practical test: § 61.65(a)(6)' },
      { code: 'A.40', label: 'Prerequisites for instrument practical tests: § 61.39(a)' },
    ],
  },
  {
    title: 'Flight Instructor Endorsements (Other Than Flight Instructors with a Sport Pilot Rating)',
    items: [
      { code: 'A.41', label: 'Fundamentals of instructing knowledge test: § 61.183(d)' },
      { code: 'A.42', label: 'Flight instructor aeronautical knowledge test: § 61.183(f)' },
      { code: 'A.43', label: 'Flight instructor ground and flight proficiency/practical test: § 61.183(g)' },
      { code: 'A.44', label: 'Flight instructor certificate with instrument—(category/class) rating/practical test: §§ 61.183(g) and 61.187(a) and (b)(7)' },
      { code: 'A.45', label: 'Spin training: § 61.183(i)(1)' },
      { code: 'A.46', label: 'Helicopter Touchdown Autorotation: FAA-S-8081-7' },
    ],
  },
  {
    title: 'Flight Instructor with a Sport Pilot Rating Endorsement',
    items: [
      { code: 'A.47', label: 'Fundamentals of instructing knowledge test: § 61.405(a)(1)' },
      { code: 'A.48', label: 'Sport pilot flight instructor aeronautical knowledge test: §§ 61.35(a)(1) and 61.405(a)' },
      { code: 'A.49', label: 'Flight instructor flight proficiency check to provide training in a different category or class of aircraft (additional category/class): §§ 61.409 and 61.419' },
      { code: 'A.50', label: 'Passing the flight instructor flight proficiency check to provide training in a different category or class of aircraft (additional category/class): §§ 61.409 and 61.419' },
      { code: 'A.51', label: 'Flight instructor practical test: §§ 61.409 and 61.411' },
      { code: 'A.52', label: 'Passing the flight instructor practical test: §§ 61.409 and 61.411' },
      { code: 'A.53', label: 'Sport pilot instructor to train sport pilots on flight by reference to instruments: § 61.412' },
      { code: 'A.54', label: 'Spin training: § 61.405(b)(1)(ii)' },
    ],
  },
  {
    title: 'Ground Instructor Endorsement',
    items: [
      { code: 'A.55', label: 'Ground instructor who does not meet the recent experience requirements: § 61.217(d)' },
    ],
  },
  {
    title: 'SFAR 73 – Robinson R-22/R-44 Special Training and Experience Requirements',
    items: [
      { code: 'A.56', label: 'R-22/R-44 awareness training: SFAR 73, section 2(a)(1) or (2)' },
      { code: 'A.57', label: 'R-22 solo endorsement: SFAR 73, section 2(b)(3)' },
      { code: 'A.58', label: 'R-22 pilot-in-command endorsement: SFAR 73, section 2(b)(1)(ii)' },
    ],
  },
];
