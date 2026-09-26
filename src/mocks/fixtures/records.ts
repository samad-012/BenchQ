import type { Record_, RecordEvidence, RecordExperience, RecordSkill, RecordEducation, RecordCertificate } from "@/lib/schemas/record";
import type { ClaimState, FieldSource } from "@/lib/schemas/enums";
import { candidatesFixture } from "./candidates";
import { daysAgo, resetSeed, seededRandom, pick } from "./_seed";

resetSeed(600);

const COMPANIES_POOL = [
  "Wipro", "TCS", "Infosys", "Cognizant", "HCL", "Tech Mahindra",
  "Accenture", "Deloitte", "IBM", "Oracle", "Microsoft", "Amazon",
  "JP Morgan", "Capital One", "Wells Fargo", "UnitedHealth",
  "State Farm", "Verizon", "AT&T", "FedEx",
];

const SKILLS_BY_ROLE: Record<string, string[]> = {
  "Senior Java Developer": ["Java", "Spring Boot", "PostgreSQL", "Kafka", "Docker", "Kubernetes", "AWS", "Redis", "JUnit", "Maven"],
  "Data Engineer": ["Python", "Snowflake", "Spark", "Airflow", "SQL", "dbt", "Kafka", "AWS", "Pandas", "Databricks"],
  ".NET Developer": ["C#", ".NET Core", "Azure", "SQL Server", "Entity Framework", "Blazor", "xUnit", "Docker", "Azure DevOps"],
  "QA Automation Engineer": ["Selenium", "Cypress", "Java", "Python", "TestNG", "Jira", "Jenkins", "REST Assured", "Postman"],
  "Cloud Architect": ["AWS", "Azure", "GCP", "Terraform", "Kubernetes", "CloudFormation", "VPC", "IAM", "Docker", "Datadog"],
  "Salesforce Developer": ["Apex", "Salesforce", "LWC", "SOQL", "REST API", "Flows", "Visualforce", "Git", "CI/CD"],
  "React Frontend Developer": ["React", "TypeScript", "Next.js", "Tailwind CSS", "Jest", "GraphQL", "Redux", "HTML5", "CSS3"],
  "SAP ABAP Developer": ["SAP ABAP", "S/4HANA", "IDocs", "BAPIs", "Fiori", "OData", "SmartForms", "ALV", "HANA SQL"],
  "Python/Django Developer": ["Python", "Django", "FastAPI", "PostgreSQL", "Celery", "Redis", "Docker", "REST API"],
  "ServiceNow Developer": ["ServiceNow", "JavaScript", "GlideScript", "ITSM", "REST API", "ITIL", "HTML", "CSS"],
  "Java Full Stack Developer": ["Java", "Spring Boot", "Angular", "React", "PostgreSQL", "MongoDB", "Docker", "AWS"],
  "Senior DevOps Engineer": ["Terraform", "Kubernetes", "AWS", "Docker", "Jenkins", "ArgoCD", "Python", "Datadog", "Helm"],
  "Business Analyst": ["Jira", "SQL", "Confluence", "Tableau", "Excel", "BPMN", "Visio"],
  "Java Developer": ["Java", "Spring", "SQL", "Maven", "JUnit", "Git"],
};

const PROFICIENCY_LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"] as const;
const FIELD_SOURCES: FieldSource[] = ["MANUAL", "RESUME_UPLOAD", "LINKEDIN_EXPORT", "AI_EXTRACTED"];

function makeEvidence(recordId: string, entityType: RecordEvidence["entityType"], entityId: string, idx: number): RecordEvidence {
  return {
    id: `ev_${recordId}_${idx}`,
    recordId,
    entityType,
    entityId,
    documentId: seededRandom() > 0.3 ? `doc_${recordId}_resume` : null,
    excerpt: pick([
      "Managed a team of 12 engineers across 3 time zones",
      "Led migration from monolith to microservices architecture",
      "Implemented CI/CD pipeline reducing deploy time by 60%",
      "Designed data warehouse processing 2TB daily",
      "Built REST APIs serving 10M requests/day",
      "Automated regression test suite covering 85% of codebase",
      null,
    ]),
    pageNumber: seededRandom() > 0.5 ? 1 + Math.floor(seededRandom() * 3) : null,
    confirmedByUserId: pick(["user_adnan", "user_sneha", "user_vikram"]),
    confirmedAt: daysAgo(Math.floor(seededRandom() * 30)),
    source: pick(FIELD_SOURCES),
  };
}

function makeExperiences(recordId: string, role: string, yoe: number): { exps: RecordExperience[]; evidence: RecordEvidence[] } {
  const count = Math.min(2 + Math.floor(seededRandom() * 3), Math.ceil(yoe / 3));
  const exps: RecordExperience[] = [];
  const evidence: RecordEvidence[] = [];
  let evIdx = 0;
  let currentYear = new Date().getFullYear();

  for (let i = 0; i < count; i++) {
    const duration = 1 + Math.floor(seededRandom() * 4);
    const isCurrent = i === 0;
    const company = pick(COMPANIES_POOL);
    const expId = `exp_${recordId}_${i}`;
    const startYear = currentYear - duration;

    const bulletCount = 2 + Math.floor(seededRandom() * 3);
    const bullets = Array.from({ length: bulletCount }, (_, bi) => {
      const state: ClaimState = seededRandom() > 0.2 ? "VERIFIED" : seededRandom() > 0.5 ? "UNVERIFIED" : "CONTRADICTED";
      let evidenceId: string | null = null;
      if (state === "VERIFIED") {
        const ev = makeEvidence(recordId, "experience", expId, evIdx++);
        evidence.push(ev);
        evidenceId = ev.id;
      }
      return {
        id: `bul_${recordId}_${i}_${bi}`,
        text: pick([
          `Developed and maintained ${pick(["microservices", "REST APIs", "data pipelines", "frontend components"])} serving ${Math.floor(seededRandom() * 50)}M+ users`,
          `Led team of ${2 + Math.floor(seededRandom() * 10)} engineers on ${pick(["platform migration", "greenfield project", "performance optimization"])}`,
          `Reduced ${pick(["deployment time", "latency", "costs", "bug count"])} by ${20 + Math.floor(seededRandom() * 60)}% through ${pick(["automation", "refactoring", "caching", "monitoring"])}`,
          `Implemented ${pick(["CI/CD pipeline", "monitoring stack", "test automation", "security scanning"])} improving ${pick(["reliability", "velocity", "coverage"])}`,
        ]),
        state,
        evidenceId,
      };
    });

    const expState: ClaimState = bullets.every((b) => b.state === "VERIFIED") ? "VERIFIED" : "UNVERIFIED";

    exps.push({
      id: expId,
      company,
      title: i === 0 ? role : pick(["Software Engineer", "Developer", "Analyst", "Consultant", "Team Lead"]),
      location: pick(["Dallas, TX", "New York, NY", "Bangalore, India", "Hyderabad, India", "Remote"]),
      startDate: new Date(startYear, Math.floor(seededRandom() * 12), 1).toISOString(),
      endDate: isCurrent ? null : new Date(currentYear, Math.floor(seededRandom() * 12), 1).toISOString(),
      isCurrent,
      bullets,
      technologies: SKILLS_BY_ROLE[role]?.slice(0, 3 + Math.floor(seededRandom() * 4)) ?? [],
      sortOrder: i,
      source: pick(FIELD_SOURCES),
      state: expState,
    });

    currentYear = startYear;
  }

  return { exps, evidence };
}

function makeSkills(recordId: string, role: string): RecordSkill[] {
  const skillNames = SKILLS_BY_ROLE[role] ?? SKILLS_BY_ROLE["Java Developer"]!;
  return skillNames.map((name, i) => ({
    id: `skill_${recordId}_${i}`,
    name,
    canonicalName: name.toLowerCase(),
    family: pick(["Languages", "Frameworks", "Databases", "Cloud", "Tools", null]),
    yearsUsed: 1 + Math.floor(seededRandom() * 8),
    lastUsedYear: 2024 + Math.floor(seededRandom() * 2),
    proficiency: pick(PROFICIENCY_LEVELS),
    source: pick(FIELD_SOURCES),
    state: seededRandom() > 0.15 ? "VERIFIED" as const : "UNVERIFIED" as const,
  }));
}

function makeEducation(recordId: string): RecordEducation[] {
  return [{
    id: `edu_${recordId}_0`,
    institution: pick([
      "University of Texas at Dallas", "Georgia Tech", "Ohio State University",
      "JNTU Hyderabad", "IIT Bombay", "NIT Warangal", "University of Houston",
      "Arizona State University", "NC State University", "Rutgers University",
    ]),
    degree: pick(["Master of Science", "Bachelor of Technology", "Master of Technology", "Bachelor of Science"]),
    field: pick(["Computer Science", "Information Technology", "Software Engineering", "Electrical Engineering", "Data Science"]),
    startDate: daysAgo(365 * (4 + Math.floor(seededRandom() * 6))),
    endDate: daysAgo(365 * (2 + Math.floor(seededRandom() * 4))),
    source: pick(FIELD_SOURCES),
    state: "VERIFIED" as const,
  }];
}

function makeCertificates(recordId: string): RecordCertificate[] {
  if (seededRandom() > 0.6) return [];
  const count = 1 + Math.floor(seededRandom() * 2);
  const certPool: Array<{ name: string; issuer: string }> = [
    { name: "AWS Solutions Architect Associate", issuer: "Amazon Web Services" },
    { name: "AWS Developer Associate", issuer: "Amazon Web Services" },
    { name: "Azure Administrator Associate", issuer: "Microsoft" },
    { name: "Certified Kubernetes Administrator", issuer: "CNCF" },
    { name: "Salesforce Platform Developer I", issuer: "Salesforce" },
    { name: "ServiceNow CSA", issuer: "ServiceNow" },
    { name: "PMP", issuer: "PMI" },
    { name: "Scrum Master", issuer: "Scrum Alliance" },
  ];
  return Array.from({ length: count }, (_, i) => {
    const cert = pick(certPool);
    return {
      id: `cert_${recordId}_${i}`,
      name: cert.name,
      issuer: cert.issuer,
      issueDate: daysAgo(Math.floor(365 + seededRandom() * 730)),
      expiryDate: seededRandom() > 0.4 ? daysAgo(-Math.floor(365 + seededRandom() * 730)) : null,
      credentialId: seededRandom() > 0.3 ? `CRED-${Math.floor(seededRandom() * 999999)}` : null,
      credentialUrl: null,
      source: pick(FIELD_SOURCES),
      state: seededRandom() > 0.1 ? "VERIFIED" as const : "UNVERIFIED" as const,
    };
  });
}

export const recordsFixture: Record_[] = candidatesFixture.map((candidate) => {
  const recordId = `rec_${candidate.id}`;
  const role = candidate.primaryRole ?? "Software Developer";
  const yoe = candidate.yearsExperience ?? 3;
  const { exps, evidence } = makeExperiences(recordId, role, yoe);
  const skills = makeSkills(recordId, role);
  const educations = makeEducation(recordId);
  const certificates = makeCertificates(recordId);

  const summaryState: ClaimState = seededRandom() > 0.2 ? "VERIFIED" : "UNVERIFIED";

  return {
    id: recordId,
    candidateId: candidate.id,
    headline: `${role} with ${yoe}+ years of experience`,
    summary: `Experienced ${role.toLowerCase()} specializing in enterprise applications. Strong track record of delivering scalable solutions in fast-paced environments.`,
    summaryState,
    experiences: exps,
    educations,
    skills,
    certificates,
    evidence,
    lastVerifiedAt: seededRandom() > 0.3 ? daysAgo(Math.floor(seededRandom() * 14)) : null,
  };
});

export function getRecordByCandidate(candidateId: string): Record_ | undefined {
  return recordsFixture.find((r) => r.candidateId === candidateId);
}
