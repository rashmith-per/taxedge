export const ENTITY_TYPES = [
  "Private Limited",
  "Public Limited",
  "Limited Liability Partnership (LLP)",
  "Partnership Firm",
  "Proprietorship",
  "Special Purpose Vehicle (SPV)",
  "Joint Venture",
];

export const BANKING_RELATIONSHIPS = [
  "Existing Borrower",
  "Savings Account Holder",
  "Current Account Holder",
  "Fixed Deposit Customer",
  "New Customer",
];

export const BUSINESS_ACTIVITIES = [
  "Manufacturing & Industrial",
  "Renewable Energy & Power",
  "Infrastructure & Construction",
  "Commercial Real Estate",
  "Logistics & Warehousing",
  "Healthcare & Pharma",
  "Hospitality & Tourism",
  "IT & Data Centers",
];

export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Telangana",
  "Karnataka",
  "Maharashtra",
  "Tamil Nadu",
  "Gujarat",
  "Delhi NCR",
  "West Bengal",
  "Rajasthan",
  "Uttar Pradesh",
];

export const CITIES_BY_STATE: Record<string, string[]> = {
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Tirupati", "Nellore"],
  Telangana: ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam"],
  Karnataka: ["Bengaluru", "Mysuru", "Mangaluru", "Hubballi", "Belagavi"],
  Maharashtra: ["Mumbai", "Pune", "Nagpur", "Nashik", "Thane", "Aurangabad"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem"],
  Gujarat: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar"],
  "Delhi NCR": ["New Delhi", "Gurugram", "Noida", "Faridabad", "Ghaziabad"],
};

export const PROJECT_SECTORS = [
  "Energy & Power",
  "Transportation & Infra",
  "Industrial Manufacturing",
  "Commercial Real Estate",
  "Healthcare & Life Sciences",
  "Water & Waste Management",
];

export const SUB_SECTORS: Record<string, string[]> = {
  "Energy & Power": ["Solar PV", "Wind Energy", "Hydro Electric", "Thermal Power", "Green Hydrogen"],
  "Transportation & Infra": ["Highways & Roads", "Ports & Logistics", "Airports", "Rail Freight"],
  "Industrial Manufacturing": ["Auto Components", "Steel & Metals", "Textiles", "Chemicals & Fertilizer"],
  "Commercial Real Estate": ["IT Parks", "Shopping Malls", "Grade-A Warehousing", "Mixed Use Development"],
  "Healthcare & Life Sciences": ["Multi-Specialty Hospital", "Pharma API Plant", "Medical Equipment"],
};

export const PROJECT_TYPES = [
  "Greenfield Project",
  "Brownfield Expansion",
  "Modernization & Upgradation",
  "Debt Refinancing",
];

export const DEVELOPMENT_CATEGORIES = [
  "Greenfield",
  "Expansion",
  "Modernization",
  "Diversification",
];

export const INITIAL_PROMOTERS = [
  {
    id: "p1",
    name: "Mr. Rajesh Kumar",
    type: "Individual" as const,
    sharePercentage: 60,
    initials: "RK",
  },
  {
    id: "p2",
    name: "Ms. Priya Sharma",
    type: "Individual" as const,
    sharePercentage: 30,
    initials: "PS",
  },
  {
    id: "p3",
    name: "ABC Holdings Pvt Ltd",
    type: "Corporate" as const,
    sharePercentage: 10,
    initials: "AH",
  },
];

// Step 2 Constants
export const PROJECT_ZONES = [
  "Industrial Zone / Park",
  "Special Economic Zone (SEZ)",
  "Commercial Zone",
  "Agricultural / Rural",
  "Port / Coastal Zone",
];

export const LAND_OWNERSHIP_OPTIONS = [
  "Freehold",
  "Leasehold (Govt / SIDA)",
  "Leasehold (Private)",
  "Mortgaged Allotment",
];

export const LAND_USE_OPTIONS = [
  "Industrial",
  "Commercial",
  "Agricultural",
  "Mixed Utility",
];

export const TITLE_STATUS_OPTIONS = [
  "Clear & Marketable",
  "Pending Clearance",
  "Under Litigation",
  "Encumbered",
];

export const ENCUMBRANCE_OPTIONS = [
  "Nil / Unencumbered",
  "Bank Charge Created",
  "Lien / Leasehold Charge",
];

export const NA_CONVERSION_OPTIONS = [
  "NA Converted",
  "Applied / Pending",
  "Exempt / Not Applicable",
];

export const ACQUISITION_STATUS_OPTIONS = [
  "Fully Acquired",
  "Agreement Signed",
  "Under Negotiation",
  "Pending Allotment",
];

export const ROW_TYPES = [
  "Pipeline Corridor",
  "Transmission Line",
  "Approach Access Road",
  "Railway Siding",
];

export const ROW_STATUS_OPTIONS = [
  "Fully Obtained",
  "Partially Obtained",
  "In Process",
  "Not Applied",
];

export const APPROVAL_STATUS_OPTIONS = [
  "Approved",
  "Submitted / Pending",
  "In Review",
];

export const POWER_SOURCES = [
  "State Grid (DISCOM)",
  "Dedicated Substation",
  "Captive Solar / Wind",
  "Dual Source (Grid + DG)",
];

export const WATER_SOURCES = [
  "Borewell / Groundwater",
  "Municipal / MIDC Line",
  "River / Water Body",
  "Desalination Plant",
];

export const APPROACH_ROADS = [
  "NH / State Highway",
  "4-Lane Industrial Road",
  "2-Lane Paved Road",
  "Unpaved Access",
];

export const DRAINAGE_OPTIONS = [
  "Internal STP / ETP Plant",
  "Municipal Common Drain",
  "Closed Pipeline Network",
];

export const WASTE_OPTIONS = [
  "Zero Liquid Discharge (ZLD)",
  "Hazardous Waste Facility",
  "Solid Waste Management",
];

export const OTHER_INFRA_OPTIONS = [
  "Boundary Wall & Gate",
  "Fire Fighting System",
  "Weighbridge & Security",
  "Worker Housing",
];

export const TECH_TYPES = [
  "Proprietary Technology",
  "Licensed Technology",
  "Standard Equipment",
  "Custom Fabricated",
];

export const TECH_SOURCES = [
  "Domestic (India)",
  "Imported (European)",
  "Imported (US / Japan)",
  "Joint Venture Tech",
];

// Step 4: Market & Financials Constants
export const PRODUCT_CATEGORIES = [
  "Renewable Energy",
  "Industrial Goods",
  "Consumer Product",
  "Pharmaceuticals",
  "Infrastructure Service",
  "Commercial Space",
];

export const PRODUCT_UNITS = [
  "MW",
  "MT / Annum",
  "Units / Lakhs",
  "KLD",
  "Sq. Ft.",
  "Pieces",
];

export const DOMESTIC_EXPORT_OPTIONS = [
  "Domestic",
  "Export",
  "Both (Domestic + Export)",
];

export const TARGET_MARKETS = [
  "B2B Industrial",
  "State Utility / Discom",
  "B2C Retail",
  "Government / PSU",
  "Export Markets",
];

export const MARKET_TYPES = [
  "Regulated Power PPA",
  "Commercial Merchant",
  "Long-term Offtake",
  "Open Market Spot",
];

export const TARGET_GEOGRAPHIES = [
  "Pan India",
  "Regional (South / West)",
  "State Specific",
  "Global Export",
];

export const CUSTOMER_SEGMENTS = [
  "Industrial Consortium",
  "State Electricity Boards",
  "Commercial Enterprises",
  "Retail Consumers",
];

export const SENSITIVITY_SCENARIOS = [
  "Base Case",
  "Pessimistic (-10% Volume)",
  "Adverse Pricing (-5% Price)",
  "High Raw Material Cost (+10%)",
  "Worst Case Combination",
];

export const INITIAL_PRODUCTS = [
  {
    id: "prod1",
    name: "Solar Panels",
    category: "Renewable Energy",
    unit: "MW",
    installedCapacity: "50 MW",
    expectedProduction: "45 MW",
    capacityUtilisation: "90%",
    sellingPrice: "25000",
    domesticExport: "Domestic",
    productMix: "70%",
  },
];

export const INITIAL_CUSTOMERS = [
  {
    id: "cust1",
    name: "ABC Power Limited",
    type: "Corporate",
    expectedQuantity: "30 MW",
    contractPeriodYears: "10 Years",
    estimatedRevenue: "12,00,00,000",
    isOfftaker: true,
  },
];

export const INITIAL_REVENUE_PROJECTIONS = [
  { year: "Year 1", salesVolume: "35 MW", averagePrice: "25000", revenue: "8,750,000" },
  { year: "Year 2", salesVolume: "40 MW", averagePrice: "25500", revenue: "10,200,000" },
  { year: "Year 3", salesVolume: "45 MW", averagePrice: "26000", revenue: "11,700,000" },
  { year: "Year 4", salesVolume: "48 MW", averagePrice: "26500", revenue: "12,720,000" },
  { year: "Year 5", salesVolume: "50 MW", averagePrice: "27000", revenue: "13,500,000" },
];

// Step 5: Loan Requirement & Repayment Constants
export const LOAN_TYPES = [
  "Term Loan",
  "Capex Debt",
  "Infrastructure Loan",
  "Working Capital Term Loan",
  "Equipment Finance",
];

export const SCHEME_PRODUCTS = [
  "Project Term Loan Scheme",
  "Green Energy Infrastructure Scheme",
  "Industrial Growth Debt Scheme",
  "Priority Sector Infra Facility",
];

export const PREFERRED_LENDERS = [
  "State Bank of India (SBI)",
  "HDFC Bank",
  "ICICI Bank",
  "Punjab National Bank",
  "Bank of Baroda",
  "IREDA",
  "PFC / REC Limited",
];

export const REPAYMENT_YEARS = ["3 Years", "5 Years", "7 Years", "10 Years", "12 Years", "15 Years"];

export const MORATORIUM_MONTHS = ["Nil", "6 Months", "12 Months", "18 Months", "24 Months", "36 Months"];

export const REPAYMENT_FREQUENCIES = ["Monthly", "Quarterly", "Half-Yearly", "Annual"];

export const PRIMARY_SOURCES_REPAYMENT = [
  "Project Operating Cash Flow",
  "Long-term Power Purchase Agreement (PPA)",
  "Industrial Supply Contract Inflows",
  "Commercial Lease Rentals",
];

export const SECONDARY_SOURCES_REPAYMENT = [
  "Corporate Guarantee / Sponsor Support",
  "Debt Service Reserve Account (DSRA)",
  "Escrow Account Reserves",
  "Fixed Deposit Lien",
];

export const INITIAL_REPAYMENT_SCHEDULE = [
  { year: "Year 1", openingBalance: "0", principal: "0", interest: "0", totalPayment: "0", closingBalance: "0" },
  { year: "Year 2", openingBalance: "0", principal: "0", interest: "0", totalPayment: "0", closingBalance: "0" },
  { year: "Year 3", openingBalance: "0", principal: "0", interest: "0", totalPayment: "0", closingBalance: "0" },
  { year: "Year 4", openingBalance: "0", principal: "0", interest: "0", totalPayment: "0", closingBalance: "0" },
  { year: "Year 5", openingBalance: "0", principal: "0", interest: "0", totalPayment: "0", closingBalance: "0" },
];
