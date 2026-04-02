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
    title: 'PREREQUISITES FOR THE PRACTICAL TEST ENDORSEMENT',
    items: [
      { code: 'A.1', label: 'Prerequisites for practical test' },
      { code: 'A.2', label: 'Review of deficiencies identified on airman knowledge test' },
    ],
  },
  {
    title: 'STUDENT PILOT ENDORSEMENTS',
    items: [
      { code: 'A.3', label: 'Pre-solo aeronautical knowledge' },
      { code: 'A.4', label: 'Pre-solo flight training' },
      { code: 'A.5', label: 'Pre-solo flight training at night' },
      { code: 'A.6', label: 'Solo flight (first 90-calendar-day period)' },
      { code: 'A.7', label: 'Solo flight (each additional 90-calendar-day period)' },
      { code: 'A.8', label: 'Solo takeoffs and landings at another airport within 25 NM' },
      { code: 'A.9', label: 'Solo cross-country flight' },
      { code: 'A.10', label: 'Solo cross-country flight' },
      { code: 'A.11', label: 'Repeated solo cross-country flights not more than 50 NM from point of departure' },
      { code: 'A.12', label: 'Solo flight in Class B airspace' },
      { code: 'A.13', label: 'Solo flight to, from, or at an airport in Class B airspace' },
      { code: 'A.14', label: 'Endorsement of U.S. citizenship (TSA)' },
    ],
  },
  {
    title: 'ADDITIONAL STUDENT PILOT ENDORSEMENTS FOR STUDENTS SEEKING SPORT OR RECREATIONAL PILOT CERTIFICATES',
    items: [
      { code: 'A.15', label: 'Solo flight in Class B, C, and D airspace' },
      { code: 'A.16', label: 'Solo flight to/from/at airport in Class B, C, or D airspace or towered airport' },
    ],
  },
  {
    title: 'SPORT PILOT ENDORSEMENTS',
    items: [
      { code: 'A.17', label: 'Aeronautical knowledge test' },
      { code: 'A.18', label: 'Taking flight proficiency check (different category/class)' },
      { code: 'A.19', label: 'Passing flight proficiency check (different category/class)' },
      { code: 'A.20', label: 'Taking sport pilot practical test' },
      { code: 'A.21', label: 'Passing sport pilot practical test' },
      { code: 'A.22', label: 'Passing sport pilot practical test (simplified flight controls limitation)' },
      { code: 'A.23', label: 'Operations in Class B, C, D airspace or towered airports' },
      { code: 'A.24', label: 'Aircraft with VH ≤ 87 KCAS' },
      { code: 'A.25', label: 'Aircraft with VH > 87 KCAS' },
      { code: 'A.26', label: 'Flight training at night' },
      { code: 'A.27', label: 'PIC in aircraft with retractable landing gear' },
      { code: 'A.28', label: 'PIC in airplane with controllable pitch propeller' },
    ],
  },
  {
    title: 'RECREATIONAL PILOT ENDORSEMENTS',
    items: [
      { code: 'A.29', label: 'Aeronautical knowledge test' },
      { code: 'A.30', label: 'Flight proficiency/practical test' },
      { code: 'A.31', label: 'Operate within 50 NM of training airport' },
      { code: 'A.32', label: 'PIC beyond 50 NM' },
      { code: 'A.33', label: 'Recurrent training (less than 400 hrs / 180 days inactivity)' },
      { code: 'A.34', label: 'Solo flights for additional certificate/rating' },
      { code: 'A.35', label: 'Operations in Class B, C, D airspace or towered airports' },
    ],
  },
  {
    title: 'PRIVATE PILOT ENDORSEMENTS',
    items: [
      { code: 'A.36', label: 'Aeronautical knowledge test' },
      { code: 'A.37', label: 'Flight proficiency/practical test' },
    ],
  },
  {
    title: 'COMMERCIAL PILOT ENDORSEMENTS',
    items: [
      { code: 'A.38', label: 'Aeronautical knowledge test' },
      { code: 'A.39', label: 'Flight proficiency/practical test' },
    ],
  },
  {
    title: 'AIRLINE TRANSPORT PILOT (ATP) ENDORSEMENTS',
    items: [
      { code: 'A.40', label: 'Restricted privileges ATP (AMEL)' },
      { code: 'A.41', label: 'ATP Certification Training Program (CTP)' },
    ],
  },
  {
    title: 'INSTRUMENT RATING ENDORSEMENTS',
    items: [
      { code: 'A.42', label: 'Aeronautical knowledge test' },
      { code: 'A.43', label: 'Flight proficiency/practical test' },
      { code: 'A.44', label: 'Prerequisites for instrument practical test' },
    ],
  },
  {
    title: 'FLIGHT INSTRUCTOR (OTHER THAN SPORT PILOT) ENDORSEMENTS',
    items: [
      { code: 'A.45', label: 'Fundamentals of instructing knowledge test' },
      { code: 'A.46', label: 'Flight instructor aeronautical knowledge test' },
      { code: 'A.47', label: 'Flight instructor ground & flight practical test' },
      { code: 'A.48', label: 'Flight instructor instrument rating practical test' },
      { code: 'A.49', label: 'Spin training' },
      { code: 'A.50', label: 'Helicopter touchdown autorotation' },
    ],
  },
  {
    title: 'FLIGHT INSTRUCTOR WITH A SPORT PILOT RATING ENDORSEMENTS',
    items: [
      { code: 'A.51', label: 'Fundamentals of instructing knowledge test' },
      { code: 'A.52', label: 'Sport pilot instructor aeronautical knowledge test' },
      { code: 'A.53', label: 'Flight instructor proficiency check (additional category/class)' },
      { code: 'A.54', label: 'Proficiency check completion (additional category/class)' },
      { code: 'A.55', label: 'Practical test endorsement' },
      { code: 'A.56', label: 'Practical test completion endorsement' },
      { code: 'A.57', label: 'Training sport pilots by reference to instruments' },
      { code: 'A.58', label: 'Spin training' },
    ],
  },
  {
    title: 'GROUND INSTRUCTOR ENDORSEMENT',
    items: [
      { code: 'A.59', label: 'Ground instructor (does not meet recent experience requirements)' },
    ],
  },
  {
    title: 'SFAR 73 – ROBINSON R-22/R-44 ENDORSEMENTS',
    items: [
      { code: 'A.60', label: 'R-22/R-44 ground training' },
      { code: 'A.61', label: 'R-22 solo endorsement' },
      { code: 'A.62', label: 'R-22 PIC endorsement' },
      { code: 'A.63', label: 'R-22 flight instructor endorsement' },
      { code: 'A.64', label: 'R-22 flight review' },
      { code: 'A.65', label: 'R-44 solo endorsement' },
      { code: 'A.66', label: 'R-44 PIC endorsement' },
      { code: 'A.67', label: 'R-44 flight instructor endorsement' },
      { code: 'A.68', label: 'R-44 flight review' },
    ],
  },
  {
    title: 'ADDITIONAL ENDORSEMENTS',
    items: [
      { code: 'A.69', label: 'Flight review completion' },
      { code: 'A.70', label: 'WINGS program phase completion' },
      { code: 'A.71', label: 'Instrument proficiency check (IPC)' },
      { code: 'A.72', label: 'PIC in complex airplane' },
      { code: 'A.73', label: 'PIC in high-performance airplane' },
      { code: 'A.74', label: 'PIC in pressurized aircraft (high-altitude)' },
      { code: 'A.75', label: 'PIC in tailwheel airplane' },
      { code: 'A.76', label: 'PIC solo without category/class rating' },
      { code: 'A.77', label: 'Retesting after failure' },
      { code: 'A.78', label: 'Additional category/class rating' },
      { code: 'A.79', label: 'Type rating (non-ATP)' },
      { code: 'A.80', label: 'Type rating + category/class (non-ATP)' },
      { code: 'A.81', label: 'Type rating (ATP level)' },
      { code: 'A.82', label: 'Type rating + category/class (ATP level)' },
      { code: 'A.83', label: 'Glider launch procedures' },
      { code: 'A.84', label: 'Glider/ultralight towing experience' },
      { code: 'A.85', label: 'Glider/ultralight towing training' },
      { code: 'A.86', label: 'Home-study curriculum review' },
      { code: 'A.87', label: 'Ultralight aeronautical experience credit' },
    ],
  },
  {
    title: 'NIGHT VISION GOGGLES OPERATIONS (NVGO)',
    items: [
      { code: 'A.88', label: 'NVG ground training' },
      { code: 'A.89', label: 'NVG flight training' },
      { code: 'A.90', label: 'NVG instructor authorization' },
    ],
  },
  {
    title: 'ENHANCED FLIGHT VISION SYSTEM (EFVS)',
    items: [
      { code: 'A.91', label: 'EFVS ground training' },
      { code: 'A.92', label: 'EFVS flight training' },
      { code: 'A.93', label: 'EFVS ground and flight training' },
      { code: 'A.94', label: 'EFVS supplementary training' },
    ],
  },
  {
    title: 'SIMPLIFIED FLIGHT CONTROLS',
    items: [
      { code: 'A.95', label: 'PIC in aircraft with simplified flight controls' },
      { code: 'A.96', label: 'Initial cadre training (simplified flight controls)' },
    ],
  },
];
