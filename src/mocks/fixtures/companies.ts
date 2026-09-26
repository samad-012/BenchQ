import type { Company, CompanyVerification, H1bData } from "@/lib/schemas/company";
import { daysAgo, daysFromNow, resetSeed, seededRandom, pick } from "./_seed";

resetSeed(300);

function h1b(sponsors: boolean | null, lcaCount: number | null): H1bData | null {
  if (sponsors === null && lcaCount === null) return null;
  return {
    sponsorsH1b: sponsors,
    lcaCount: lcaCount,
    lcaYear: lcaCount ? 2025 : null,
    medianLcaWage: lcaCount ? 75000 + Math.floor(seededRandom() * 60000) : null,
    topLcaTitles: lcaCount
      ? ["Software Developer", "Systems Analyst", "Data Engineer"].slice(0, 1 + Math.floor(seededRandom() * 3))
      : [],
    dataSource: sponsors !== null ? "DOL_LCA" : null,
    lastCheckedAt: sponsors !== null ? daysAgo(Math.floor(seededRandom() * 60)) : null,
  };
}

function verified(companyId: string): CompanyVerification {
  return {
    id: `ver_${companyId}`,
    companyId,
    verdict: "VERIFIED",
    rules: [
      { rule: "HAS_WEBSITE", label: "Has functioning website", passed: true, observed: null },
      { rule: "EMPLOYEE_COUNT", label: "10+ employees", passed: true, observed: null },
      { rule: "US_PRESENCE", label: "US office confirmed", passed: true, observed: null },
    ],
    firedRule: null,
    isManual: false,
    overrideReason: null,
    checkedAt: daysAgo(Math.floor(seededRandom() * 30)),
    expiresAt: daysFromNow(Math.floor(60 + seededRandom() * 120)),
  };
}

function caution(companyId: string, rule: string, label: string): CompanyVerification {
  return {
    id: `ver_${companyId}`,
    companyId,
    verdict: "CAUTION",
    rules: [
      { rule, label, passed: false, observed: "Flagged during automated check" },
    ],
    firedRule: rule,
    isManual: false,
    overrideReason: null,
    checkedAt: daysAgo(Math.floor(seededRandom() * 30)),
    expiresAt: daysFromNow(Math.floor(30 + seededRandom() * 60)),
  };
}

function rejected(companyId: string, rule: string, label: string, observed: string): CompanyVerification {
  return {
    id: `ver_${companyId}`,
    companyId,
    verdict: "REJECTED",
    rules: [
      { rule, label, passed: false, observed },
    ],
    firedRule: rule,
    isManual: false,
    overrideReason: null,
    checkedAt: daysAgo(Math.floor(seededRandom() * 30)),
    expiresAt: daysFromNow(Math.floor(30 + seededRandom() * 60)),
  };
}

type Spec = {
  name: string;
  domain: string | null;
  clientType: Company["clientType"];
  band: Company["employeeBand"];
  sponsors: boolean | null;
  lcaCount: number | null;
  verdict: "VERIFIED" | "CAUTION" | "REJECTED";
  rejRule?: string;
  rejLabel?: string;
  rejObs?: string;
};

const specs: Spec[] = [
  // 20 DIRECT_CLIENT
  { name: "JPMorgan Chase", domain: "jpmorgan.com", clientType: "DIRECT_CLIENT", band: "1000+", sponsors: true, lcaCount: 450, verdict: "VERIFIED" },
  { name: "Bank of America", domain: "bankofamerica.com", clientType: "DIRECT_CLIENT", band: "1000+", sponsors: true, lcaCount: 380, verdict: "VERIFIED" },
  { name: "Wells Fargo", domain: "wellsfargo.com", clientType: "DIRECT_CLIENT", band: "1000+", sponsors: true, lcaCount: 320, verdict: "VERIFIED" },
  { name: "Capital One", domain: "capitalone.com", clientType: "DIRECT_CLIENT", band: "1000+", sponsors: true, lcaCount: 290, verdict: "VERIFIED" },
  { name: "UnitedHealth Group", domain: "unitedhealthgroup.com", clientType: "DIRECT_CLIENT", band: "1000+", sponsors: true, lcaCount: 210, verdict: "VERIFIED" },
  { name: "Anthem Inc", domain: "anthem.com", clientType: "DIRECT_CLIENT", band: "1000+", sponsors: true, lcaCount: 180, verdict: "VERIFIED" },
  { name: "Target Corporation", domain: "target.com", clientType: "DIRECT_CLIENT", band: "1000+", sponsors: true, lcaCount: 150, verdict: "VERIFIED" },
  { name: "Home Depot", domain: "homedepot.com", clientType: "DIRECT_CLIENT", band: "1000+", sponsors: true, lcaCount: 120, verdict: "VERIFIED" },
  { name: "Verizon Communications", domain: "verizon.com", clientType: "DIRECT_CLIENT", band: "1000+", sponsors: true, lcaCount: 200, verdict: "VERIFIED" },
  { name: "AT&T Inc", domain: "att.com", clientType: "DIRECT_CLIENT", band: "1000+", sponsors: true, lcaCount: 170, verdict: "VERIFIED" },
  { name: "Fidelity Investments", domain: "fidelity.com", clientType: "DIRECT_CLIENT", band: "1000+", sponsors: true, lcaCount: 260, verdict: "VERIFIED" },
  { name: "State Farm Insurance", domain: "statefarm.com", clientType: "DIRECT_CLIENT", band: "1000+", sponsors: true, lcaCount: 90, verdict: "VERIFIED" },
  { name: "Cigna Healthcare", domain: "cigna.com", clientType: "DIRECT_CLIENT", band: "1000+", sponsors: true, lcaCount: 110, verdict: "VERIFIED" },
  { name: "FedEx Services", domain: "fedex.com", clientType: "DIRECT_CLIENT", band: "1000+", sponsors: true, lcaCount: 85, verdict: "VERIFIED" },
  { name: "CVS Health", domain: "cvshealth.com", clientType: "DIRECT_CLIENT", band: "1000+", sponsors: true, lcaCount: 130, verdict: "VERIFIED" },
  { name: "American Express", domain: "americanexpress.com", clientType: "DIRECT_CLIENT", band: "1000+", sponsors: true, lcaCount: 190, verdict: "VERIFIED" },
  { name: "Progressive Insurance", domain: "progressive.com", clientType: "DIRECT_CLIENT", band: "1000+", sponsors: true, lcaCount: 70, verdict: "VERIFIED" },
  { name: "Fannie Mae", domain: "fanniemae.com", clientType: "DIRECT_CLIENT", band: "1000+", sponsors: true, lcaCount: 95, verdict: "VERIFIED" },
  { name: "Lockton Companies", domain: "lockton.com", clientType: "DIRECT_CLIENT", band: "501-1000", sponsors: false, lcaCount: 0, verdict: "CAUTION", rejRule: "LOW_GLASSDOOR_RATING", rejLabel: "Glassdoor rating below 3.0" },
  { name: "QuietRiver Analytics", domain: "quietriver.io", clientType: "DIRECT_CLIENT", band: "51-200", sponsors: false, lcaCount: 0, verdict: "CAUTION", rejRule: "COMPANY_AGE_UNDER_2Y", rejLabel: "Company less than 2 years old" },

  // 22 PRIME_VENDOR
  { name: "Infosys Limited", domain: "infosys.com", clientType: "PRIME_VENDOR", band: "1000+", sponsors: true, lcaCount: 400, verdict: "VERIFIED" },
  { name: "Wipro Limited", domain: "wipro.com", clientType: "PRIME_VENDOR", band: "1000+", sponsors: true, lcaCount: 350, verdict: "VERIFIED" },
  { name: "TCS America", domain: "tcs.com", clientType: "PRIME_VENDOR", band: "1000+", sponsors: true, lcaCount: 420, verdict: "VERIFIED" },
  { name: "Cognizant Technology", domain: "cognizant.com", clientType: "PRIME_VENDOR", band: "1000+", sponsors: true, lcaCount: 380, verdict: "VERIFIED" },
  { name: "HCL Technologies", domain: "hcltech.com", clientType: "PRIME_VENDOR", band: "1000+", sponsors: true, lcaCount: 310, verdict: "VERIFIED" },
  { name: "Tech Mahindra", domain: "techmahindra.com", clientType: "PRIME_VENDOR", band: "1000+", sponsors: true, lcaCount: 250, verdict: "VERIFIED" },
  { name: "Mphasis Limited", domain: "mphasis.com", clientType: "PRIME_VENDOR", band: "1000+", sponsors: true, lcaCount: 140, verdict: "VERIFIED" },
  { name: "LTIMindtree", domain: "ltimindtree.com", clientType: "PRIME_VENDOR", band: "1000+", sponsors: true, lcaCount: 200, verdict: "VERIFIED" },
  { name: "Syntel Inc", domain: "syntel.com", clientType: "PRIME_VENDOR", band: "1000+", sponsors: true, lcaCount: 160, verdict: "VERIFIED" },
  { name: "Hexaware Technologies", domain: "hexaware.com", clientType: "PRIME_VENDOR", band: "1000+", sponsors: true, lcaCount: 110, verdict: "VERIFIED" },
  { name: "UST Global", domain: "ust.com", clientType: "PRIME_VENDOR", band: "1000+", sponsors: true, lcaCount: 100, verdict: "VERIFIED" },
  { name: "Kforce Inc", domain: "kforce.com", clientType: "PRIME_VENDOR", band: "1000+", sponsors: false, lcaCount: 0, verdict: "VERIFIED" },
  { name: "Randstad Digital", domain: "randstaddigital.com", clientType: "PRIME_VENDOR", band: "1000+", sponsors: false, lcaCount: 0, verdict: "VERIFIED" },
  { name: "Apex Systems", domain: "apexsystems.com", clientType: "PRIME_VENDOR", band: "1000+", sponsors: false, lcaCount: 0, verdict: "VERIFIED" },
  { name: "Insight Global", domain: "insightglobal.com", clientType: "PRIME_VENDOR", band: "1000+", sponsors: false, lcaCount: 0, verdict: "VERIFIED" },
  { name: "Collabera Inc", domain: "collabera.com", clientType: "PRIME_VENDOR", band: "501-1000", sponsors: true, lcaCount: 80, verdict: "CAUTION", rejRule: "CONTRACTOR_COMPLAINTS", rejLabel: "Multiple contractor complaints on file" },
  { name: "Brillio LLC", domain: "brillio.com", clientType: "PRIME_VENDOR", band: "501-1000", sponsors: true, lcaCount: 60, verdict: "VERIFIED" },
  { name: "Miraclesoft Inc", domain: "miraclesoft.com", clientType: "PRIME_VENDOR", band: "201-500", sponsors: null, lcaCount: null, verdict: "CAUTION", rejRule: "INCONSISTENT_ADDRESS", rejLabel: "Registered address inconsistent with office" },
  { name: "Diverse Lynx", domain: "diverselynx.com", clientType: "PRIME_VENDOR", band: "201-500", sponsors: null, lcaCount: null, verdict: "CAUTION", rejRule: "HIGH_TURNOVER_RATE", rejLabel: "High employee turnover reported" },
  { name: "ProKarma Inc", domain: "prokarma.com", clientType: "PRIME_VENDOR", band: "201-500", sponsors: true, lcaCount: 40, verdict: "CAUTION", rejRule: "PENDING_LITIGATION", rejLabel: "Pending DOL litigation" },
  { name: "Falcon Tech Solutions", domain: "falcontech.net", clientType: "PRIME_VENDOR", band: "11-50", sponsors: null, lcaCount: null, verdict: "REJECTED", rejRule: "EMPLOYEE_COUNT_UNDER_10", rejLabel: "Fewer than 10 employees", rejObs: "LinkedIn shows 8 employees" },
  { name: "NexGen IT Corp", domain: "nexgenit.com", clientType: "PRIME_VENDOR", band: "11-50", sponsors: null, lcaCount: null, verdict: "REJECTED", rejRule: "NO_FUNCTIONING_WEBSITE", rejLabel: "No functioning website", rejObs: "Domain parked, no content" },

  // 10 IMPLEMENTATION_PARTNER
  { name: "Deloitte Consulting", domain: "deloitte.com", clientType: "IMPLEMENTATION_PARTNER", band: "1000+", sponsors: true, lcaCount: 350, verdict: "VERIFIED" },
  { name: "Accenture Federal", domain: "accenture.com", clientType: "IMPLEMENTATION_PARTNER", band: "1000+", sponsors: true, lcaCount: 400, verdict: "VERIFIED" },
  { name: "IBM Consulting", domain: "ibm.com", clientType: "IMPLEMENTATION_PARTNER", band: "1000+", sponsors: true, lcaCount: 300, verdict: "VERIFIED" },
  { name: "Capgemini America", domain: "capgemini.com", clientType: "IMPLEMENTATION_PARTNER", band: "1000+", sponsors: true, lcaCount: 280, verdict: "VERIFIED" },
  { name: "PwC Advisory", domain: "pwc.com", clientType: "IMPLEMENTATION_PARTNER", band: "1000+", sponsors: true, lcaCount: 220, verdict: "VERIFIED" },
  { name: "KPMG Advisory", domain: "kpmg.com", clientType: "IMPLEMENTATION_PARTNER", band: "1000+", sponsors: true, lcaCount: 190, verdict: "VERIFIED" },
  { name: "EY Technology", domain: "ey.com", clientType: "IMPLEMENTATION_PARTNER", band: "1000+", sponsors: true, lcaCount: 170, verdict: "VERIFIED" },
  { name: "CGI Group", domain: "cgi.com", clientType: "IMPLEMENTATION_PARTNER", band: "1000+", sponsors: true, lcaCount: 130, verdict: "VERIFIED" },
  { name: "Slalom Consulting", domain: "slalom.com", clientType: "IMPLEMENTATION_PARTNER", band: "1000+", sponsors: false, lcaCount: 0, verdict: "CAUTION", rejRule: "C2C_NOT_ACCEPTED", rejLabel: "Does not accept C2C arrangements" },
  { name: "West Monroe Partners", domain: "westmonroe.com", clientType: "IMPLEMENTATION_PARTNER", band: "501-1000", sponsors: false, lcaCount: 0, verdict: "CAUTION", rejRule: "SLOW_PAYMENT_HISTORY", rejLabel: "Payment delays reported (60+ days)" },

  // 8 UNKNOWN
  { name: "DataPulse Systems", domain: "datapulse-sys.com", clientType: "UNKNOWN", band: null, sponsors: null, lcaCount: null, verdict: "CAUTION", rejRule: "INSUFFICIENT_DATA", rejLabel: "Insufficient data for verification" },
  { name: "CloudBridge Tech", domain: "cloudbridge-tech.io", clientType: "UNKNOWN", band: null, sponsors: null, lcaCount: null, verdict: "CAUTION", rejRule: "INSUFFICIENT_DATA", rejLabel: "Insufficient data for verification" },
  { name: "VortexAI Solutions", domain: null, clientType: "UNKNOWN", band: null, sponsors: null, lcaCount: null, verdict: "REJECTED", rejRule: "NO_FUNCTIONING_WEBSITE", rejLabel: "No functioning website", rejObs: "No web presence found" },
  { name: "Pinnacle InfoTech", domain: "pinnacle-infotech.com", clientType: "UNKNOWN", band: "1-10", sponsors: null, lcaCount: null, verdict: "REJECTED", rejRule: "NO_US_PRESENCE", rejLabel: "No US office confirmed", rejObs: "Only India address found" },
  { name: "StarVertex Corp", domain: "starvertex.com", clientType: "UNKNOWN", band: "11-50", sponsors: null, lcaCount: null, verdict: "CAUTION", rejRule: "RECENT_NAME_CHANGE", rejLabel: "Recent corporate name change" },
  { name: "ByteForge Inc", domain: "byteforge.dev", clientType: "UNKNOWN", band: "1-10", sponsors: false, lcaCount: 0, verdict: "REJECTED", rejRule: "THIRD_PARTY_NO_END_CLIENT", rejLabel: "Third-party vendor with no disclosed end client", rejObs: "Refused to name end client" },
  { name: "Quantum Edge LLC", domain: "quantumedge.com", clientType: "UNKNOWN", band: "11-50", sponsors: null, lcaCount: null, verdict: "CAUTION", rejRule: "MIXED_REVIEWS", rejLabel: "Mixed online reviews from contractors" },
  { name: "Aether Systems", domain: "aethersys.net", clientType: "UNKNOWN", band: null, sponsors: null, lcaCount: null, verdict: "REJECTED", rejRule: "EMPLOYEE_COUNT_UNDER_10", rejLabel: "Fewer than 10 employees", rejObs: "Could not verify any employees" },
];

function buildCompany(spec: Spec, index: number): Company {
  const id = `comp_${String(index + 1).padStart(2, "0")}`;
  const normalisedName = spec.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  let verification: CompanyVerification | null;
  if (spec.verdict === "VERIFIED") {
    verification = verified(id);
  } else if (spec.verdict === "CAUTION") {
    verification = caution(id, spec.rejRule!, spec.rejLabel!);
  } else {
    verification = rejected(id, spec.rejRule!, spec.rejLabel!, spec.rejObs!);
  }

  return {
    id,
    name: spec.name,
    normalisedName,
    domain: spec.domain,
    websiteUrl: spec.domain ? `https://${spec.domain}` : null,
    linkedinUrl: spec.domain ? `https://linkedin.com/company/${normalisedName}` : null,
    employeeBand: spec.band,
    hasUsPresence: spec.verdict !== "REJECTED" || spec.rejRule !== "NO_US_PRESENCE" ? true : false,
    clientType: spec.clientType,
    atsProvider: pick(["Greenhouse", "Lever", "iCIMS", "Workday", "Taleo", null]),
    h1b: h1b(spec.sponsors, spec.lcaCount),
    verification,
  };
}

export const companiesFixture: Company[] = specs.map((s, i) => buildCompany(s, i));

export function getCompanyById(id: string): Company | undefined {
  return companiesFixture.find((c) => c.id === id);
}
