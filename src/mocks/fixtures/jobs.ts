import type { Job, JobRequirement } from "@/lib/schemas/job";
import { companiesFixture } from "./companies";
import { daysAgo, resetSeed, seededRandom, pick } from "./_seed";

resetSeed(400);

const JD_TEMPLATES: Array<{
  title: string;
  normalisedTitle: string;
  description: string;
  skills: string[];
}> = [
  {
    title: "Senior Java Developer",
    normalisedTitle: "senior-java-developer",
    description: `We are looking for a Senior Java Developer to join our engineering team and help build scalable, high-performance backend services. You will design and implement microservices using Spring Boot, collaborate with cross-functional teams, and mentor junior developers.

Responsibilities:
- Design and develop RESTful APIs and microservices using Java 17+ and Spring Boot
- Work with PostgreSQL, Redis, and Kafka for data persistence and event-driven architecture
- Write comprehensive unit and integration tests with JUnit 5 and Mockito
- Participate in code reviews, architecture discussions, and sprint planning
- Collaborate with DevOps to deploy services on AWS (ECS, Lambda, RDS)
- Troubleshoot production issues and implement monitoring with Datadog

Requirements:
- 5+ years of professional Java development experience
- Strong understanding of Spring Boot, Spring Security, and Spring Data
- Experience with relational databases (PostgreSQL preferred) and ORM frameworks
- Familiarity with message brokers (Kafka, RabbitMQ) and caching (Redis)
- Experience with CI/CD pipelines (Jenkins, GitHub Actions)
- Bachelor's degree in Computer Science or equivalent practical experience

Nice to have:
- AWS certifications (Developer Associate or Solutions Architect)
- Experience with Kubernetes and Docker
- Knowledge of GraphQL or gRPC`,
    skills: ["Java", "Spring Boot", "PostgreSQL", "Kafka", "AWS", "Docker", "Kubernetes", "Redis"],
  },
  {
    title: "React Frontend Developer",
    normalisedTitle: "react-frontend-developer",
    description: `We are seeking a talented React Frontend Developer to build modern, responsive user interfaces for our web applications. You will work closely with UX designers and backend engineers to deliver exceptional user experiences.

Responsibilities:
- Build and maintain React applications using TypeScript and Next.js
- Implement responsive designs using Tailwind CSS and component libraries
- Integrate with REST and GraphQL APIs for data fetching
- Write unit tests with Jest and React Testing Library
- Optimize application performance (code splitting, lazy loading, memoization)
- Participate in design reviews and provide technical feedback on mockups

Requirements:
- 3+ years of experience with React and TypeScript
- Strong understanding of HTML5, CSS3, and modern JavaScript (ES2022+)
- Experience with state management (Redux, Zustand, or React Query)
- Familiarity with testing frameworks (Jest, Cypress, Playwright)
- Understanding of web accessibility standards (WCAG 2.1)
- Experience with Git and agile development workflows

Nice to have:
- Experience with Next.js or Remix
- Knowledge of design systems and component-driven development
- Experience with micro-frontend architectures`,
    skills: ["React", "TypeScript", "Next.js", "Tailwind CSS", "Jest", "GraphQL", "Redux"],
  },
  {
    title: "Data Engineer",
    normalisedTitle: "data-engineer",
    description: `We are hiring a Data Engineer to design, build, and maintain our data infrastructure. You will work with large-scale datasets, build ETL pipelines, and ensure data quality across the organization.

Responsibilities:
- Design and implement scalable ETL/ELT pipelines using Python and Apache Spark
- Build and maintain data models in Snowflake and dbt
- Orchestrate data workflows using Apache Airflow
- Monitor data quality and implement validation frameworks
- Collaborate with data scientists and analysts to support analytics use cases
- Optimize query performance and manage data warehouse costs

Requirements:
- 3+ years of experience in data engineering or related field
- Strong SQL skills and experience with columnar databases (Snowflake, BigQuery, Redshift)
- Proficiency in Python with data libraries (pandas, PySpark)
- Experience with workflow orchestration (Airflow, Prefect, Dagster)
- Knowledge of data modeling best practices (Kimball, Data Vault)
- Understanding of cloud data services (AWS Glue, S3, EMR or equivalent)

Nice to have:
- Experience with dbt for data transformation
- Knowledge of streaming frameworks (Kafka, Spark Streaming)
- Familiarity with data governance and cataloging tools`,
    skills: ["Python", "Snowflake", "Spark", "Airflow", "SQL", "dbt", "Kafka", "AWS"],
  },
  {
    title: "DevOps Engineer",
    normalisedTitle: "devops-engineer",
    description: `We are looking for a DevOps Engineer to help automate our infrastructure, improve deployment pipelines, and ensure the reliability of our production systems. You will work at the intersection of development and operations.

Responsibilities:
- Design and manage infrastructure as code using Terraform and AWS CDK
- Build and maintain CI/CD pipelines for microservices deployments
- Manage Kubernetes clusters (EKS) and containerized workloads
- Implement monitoring, alerting, and observability with Datadog and PagerDuty
- Automate security scanning and compliance checks in the deployment pipeline
- Support on-call rotation and incident response processes

Requirements:
- 4+ years of DevOps, SRE, or infrastructure engineering experience
- Strong experience with AWS services (EC2, ECS, EKS, Lambda, RDS, S3)
- Proficiency with Infrastructure as Code (Terraform, CloudFormation, or Pulumi)
- Experience with container orchestration (Kubernetes, Docker)
- Knowledge of CI/CD tools (Jenkins, GitHub Actions, GitLab CI, ArgoCD)
- Scripting skills in Python, Bash, or Go

Nice to have:
- AWS certifications (DevOps Professional or Solutions Architect)
- Experience with service mesh (Istio, Linkerd)
- Knowledge of cost optimization and FinOps practices`,
    skills: ["Terraform", "Kubernetes", "AWS", "Docker", "Jenkins", "Python", "ArgoCD", "Datadog"],
  },
  {
    title: ".NET Developer",
    normalisedTitle: "dotnet-developer",
    description: `We are seeking a skilled .NET Developer to build and maintain enterprise applications. You will work on both backend services and web applications using the Microsoft technology stack.

Responsibilities:
- Develop and maintain web applications using ASP.NET Core and C#
- Build RESTful APIs and integrate with Azure services
- Work with SQL Server and Entity Framework Core for data access
- Implement authentication and authorization using Azure AD and OAuth 2.0
- Write unit tests and integration tests with xUnit and NSubstitute
- Participate in code reviews and contribute to architectural decisions

Requirements:
- 4+ years of C# and .NET development experience
- Strong knowledge of ASP.NET Core, Web API, and Entity Framework Core
- Experience with SQL Server, T-SQL, and database design
- Familiarity with Azure services (App Service, Functions, Service Bus, Blob Storage)
- Understanding of SOLID principles and design patterns
- Experience with Git and Azure DevOps

Nice to have:
- Experience with Blazor or MAUI for frontend development
- Knowledge of microservices architecture and message queues
- Azure certifications (AZ-204 or AZ-400)`,
    skills: ["C#", ".NET Core", "Azure", "SQL Server", "Entity Framework", "Blazor"],
  },
  {
    title: "QA Automation Engineer",
    normalisedTitle: "qa-automation-engineer",
    description: `We are looking for a QA Automation Engineer to design and implement automated testing frameworks. You will ensure product quality through comprehensive test coverage across our web and API platforms.

Responsibilities:
- Design and develop automated test suites using Selenium, Cypress, or Playwright
- Create and maintain API test frameworks using REST Assured or Postman/Newman
- Integrate automated tests into CI/CD pipelines
- Develop and maintain test data management strategies
- Perform manual exploratory testing when needed
- Report bugs with detailed reproduction steps and collaborate with developers on fixes

Requirements:
- 3+ years of QA automation experience
- Proficiency in at least one programming language (Java, Python, JavaScript/TypeScript)
- Experience with UI automation frameworks (Selenium, Cypress, Playwright)
- Knowledge of API testing tools and methodologies
- Experience with test management tools (Jira, TestRail, Zephyr)
- Understanding of agile testing practices and CI/CD integration

Nice to have:
- Experience with performance testing (JMeter, k6, Gatling)
- Knowledge of mobile testing (Appium, Detox)
- ISTQB or similar certification`,
    skills: ["Selenium", "Cypress", "Java", "Python", "REST Assured", "Jenkins", "Jira"],
  },
  {
    title: "Cloud Architect",
    normalisedTitle: "cloud-architect",
    description: `We are seeking a Cloud Architect to lead the design and implementation of cloud-native solutions. You will define architecture standards, guide migration efforts, and ensure our infrastructure is secure, scalable, and cost-effective.

Responsibilities:
- Design cloud architectures for new and migrating workloads (primarily AWS)
- Establish architecture patterns, standards, and best practices
- Conduct architecture reviews and provide guidance to engineering teams
- Design disaster recovery and business continuity strategies
- Evaluate and recommend cloud services and third-party tools
- Create technical documentation including architecture decision records

Requirements:
- 8+ years of software engineering experience, 3+ in cloud architecture
- Deep expertise in AWS (VPC, EC2, ECS/EKS, Lambda, RDS, S3, CloudFront)
- Experience designing multi-region, highly available distributed systems
- Strong understanding of networking, security, and identity management in the cloud
- Knowledge of cost optimization and FinOps principles
- Excellent communication and stakeholder management skills

Nice to have:
- AWS Solutions Architect Professional certification
- Experience with multi-cloud strategies (AWS + Azure or GCP)
- Knowledge of compliance frameworks (SOC 2, HIPAA, PCI DSS)`,
    skills: ["AWS", "Azure", "GCP", "Terraform", "Kubernetes", "VPC", "CloudFormation"],
  },
  {
    title: "Salesforce Developer",
    normalisedTitle: "salesforce-developer",
    description: `We are looking for a Salesforce Developer to customize and extend our Salesforce platform. You will work on complex business processes, integrations, and Lightning Web Components.

Responsibilities:
- Develop custom solutions using Apex, Visualforce, and Lightning Web Components
- Design and implement Salesforce integrations using REST/SOAP APIs and middleware
- Configure Salesforce features including flows, process builders, and validation rules
- Migrate data between Salesforce and external systems
- Optimize platform performance and resolve governor limit issues
- Support Salesforce releases and manage deployment using Salesforce CLI and CI/CD

Requirements:
- 3+ years of Salesforce development experience
- Strong knowledge of Apex, SOQL, Visualforce, and Lightning Web Components
- Experience with Salesforce integrations (REST/SOAP APIs, MuleSoft, or similar)
- Understanding of Salesforce security model and sharing rules
- Salesforce Platform Developer I certification required
- Experience with version control (Git) and deployment tools

Nice to have:
- Salesforce Platform Developer II or other advanced certifications
- Experience with Salesforce CPQ, Service Cloud, or Experience Cloud
- Knowledge of CI/CD for Salesforce (Copado, Gearset, or SFDX)`,
    skills: ["Apex", "Salesforce", "LWC", "SOQL", "REST API", "MuleSoft"],
  },
  {
    title: "Python Backend Developer",
    normalisedTitle: "python-backend-developer",
    description: `We are hiring a Python Backend Developer to build and maintain high-performance APIs and backend services. You will work on a modern Python stack powering our core product platform.

Responsibilities:
- Design and implement RESTful APIs using Django or FastAPI
- Build and optimize database models and queries (PostgreSQL)
- Implement background task processing with Celery and Redis
- Write comprehensive tests and maintain high code coverage
- Design and implement authentication/authorization flows
- Document APIs using OpenAPI/Swagger specifications

Requirements:
- 4+ years of Python backend development experience
- Strong knowledge of Django or FastAPI frameworks
- Experience with PostgreSQL and ORM frameworks (Django ORM, SQLAlchemy)
- Familiarity with message queues and task processing (Celery, Redis, RabbitMQ)
- Understanding of API design best practices and RESTful conventions
- Experience with Docker and cloud deployment (AWS or GCP)

Nice to have:
- Experience with async Python (asyncio, FastAPI)
- Knowledge of event-driven architectures
- Experience with data pipeline tools (Airflow, Luigi)`,
    skills: ["Python", "Django", "FastAPI", "PostgreSQL", "Celery", "Redis", "Docker"],
  },
  {
    title: "ServiceNow Developer",
    normalisedTitle: "servicenow-developer",
    description: `We are seeking a ServiceNow Developer to customize and enhance our ServiceNow platform. You will work on ITSM, ITOM, and custom application development within the ServiceNow ecosystem.

Responsibilities:
- Develop and configure ServiceNow applications and modules
- Create custom Business Rules, Client Scripts, Script Includes, and UI Policies
- Build integrations using REST APIs, IntegrationHub, and Scripted REST APIs
- Implement ITSM workflows including Incident, Problem, Change, and Request management
- Develop Service Portal widgets and custom pages
- Support platform upgrades and manage update sets across instances

Requirements:
- 3+ years of ServiceNow development experience
- Strong knowledge of JavaScript and GlideScript
- Experience with ITSM, ITOM, or HRSD modules
- Familiarity with ServiceNow REST APIs and integration patterns
- ServiceNow Certified System Administrator (CSA) required
- Understanding of ITIL processes and best practices

Nice to have:
- ServiceNow Certified Application Developer (CAD)
- Experience with ServiceNow App Engine and custom scoped applications
- Knowledge of ServiceNow Performance Analytics and reporting`,
    skills: ["ServiceNow", "JavaScript", "GlideScript", "ITSM", "REST API", "ITIL"],
  },
  {
    title: "Business Analyst",
    normalisedTitle: "business-analyst",
    description: `We are looking for a Business Analyst to bridge the gap between business stakeholders and technology teams. You will gather requirements, document processes, and ensure solutions meet business objectives.

Responsibilities:
- Elicit, analyze, and document business requirements from stakeholders
- Create user stories, acceptance criteria, and process flow diagrams
- Conduct gap analysis between current and desired states
- Facilitate workshops, JAD sessions, and sprint planning meetings
- Create wireframes and mockups to communicate functional requirements
- Support UAT planning, execution, and defect triage

Requirements:
- 3+ years of business analysis experience in IT or software projects
- Strong skills in requirements gathering and documentation
- Experience with Jira, Confluence, and agile project management tools
- Proficiency in creating process diagrams (BPMN, UML)
- Knowledge of SQL for data analysis and reporting
- Excellent written and verbal communication skills

Nice to have:
- CBAP or PMI-PBA certification
- Experience with BI tools (Tableau, Power BI)
- Domain knowledge in financial services, healthcare, or insurance`,
    skills: ["Jira", "SQL", "BPMN", "Confluence", "Tableau", "Agile"],
  },
  {
    title: "SAP ABAP Developer",
    normalisedTitle: "sap-abap-developer",
    description: `We are hiring an SAP ABAP Developer to support our SAP S/4HANA implementation and ongoing development. You will work on custom ABAP programs, integrations, and data migrations.

Responsibilities:
- Develop custom ABAP programs, reports, interfaces, and enhancements
- Build and maintain SAP integrations using IDocs, BAPIs, and RFC
- Support S/4HANA migration activities including custom code remediation
- Create Fiori applications using ABAP RESTful Application Programming (RAP)
- Optimize performance of custom programs and database queries
- Provide technical specifications based on functional requirements

Requirements:
- 5+ years of SAP ABAP development experience
- Strong knowledge of ABAP, ALV, SmartForms, and Adobe Forms
- Experience with SAP integration technologies (IDocs, BAPIs, RFC, OData)
- Familiarity with S/4HANA and ABAP for HANA optimizations
- Understanding of SAP modules (FI/CO, MM, SD, or PP)
- Experience with SAP debugging and performance tuning

Nice to have:
- Experience with SAP BTP (Business Technology Platform)
- Knowledge of SAP Fiori and UI5 development
- SAP ABAP certification`,
    skills: ["SAP ABAP", "S/4HANA", "IDocs", "BAPIs", "Fiori", "OData"],
  },
];

const US_CITIES: Array<{ city: string; state: string }> = [
  { city: "New York", state: "NY" }, { city: "Dallas", state: "TX" },
  { city: "Charlotte", state: "NC" }, { city: "Atlanta", state: "GA" },
  { city: "Columbus", state: "OH" }, { city: "Phoenix", state: "AZ" },
  { city: "Plano", state: "TX" }, { city: "Jersey City", state: "NJ" },
  { city: "Chicago", state: "IL" }, { city: "Houston", state: "TX" },
  { city: "San Francisco", state: "CA" }, { city: "Seattle", state: "WA" },
  { city: "Denver", state: "CO" }, { city: "Austin", state: "TX" },
  { city: "Tampa", state: "FL" }, { city: "Minneapolis", state: "MN" },
  { city: "Raleigh", state: "NC" }, { city: "Philadelphia", state: "PA" },
  { city: "Boston", state: "MA" }, { city: "Irving", state: "TX" },
];

function makeRequirements(template: typeof JD_TEMPLATES[number]): JobRequirement[] {
  const reqs: JobRequirement[] = [];
  const mandatoryCount = 2 + Math.floor(seededRandom() * 3);
  const preferredCount = 1 + Math.floor(seededRandom() * 2);

  for (let i = 0; i < Math.min(mandatoryCount, template.skills.length); i++) {
    reqs.push({
      id: `req_${Math.floor(seededRandom() * 100000)}`,
      kind: "MANDATORY",
      category: "SKILL",
      value: template.skills[i]!,
      canonicalValue: template.skills[i]!.toLowerCase(),
      isBlocker: true,
    });
  }

  for (let i = mandatoryCount; i < Math.min(mandatoryCount + preferredCount, template.skills.length); i++) {
    reqs.push({
      id: `req_${Math.floor(seededRandom() * 100000)}`,
      kind: "PREFERRED",
      category: "SKILL",
      value: template.skills[i]!,
      canonicalValue: template.skills[i]!.toLowerCase(),
      isBlocker: false,
    });
  }

  if (seededRandom() > 0.5) {
    reqs.push({
      id: `req_${Math.floor(seededRandom() * 100000)}`,
      kind: "MANDATORY",
      category: "EXPERIENCE_YEARS",
      value: `${2 + Math.floor(seededRandom() * 8)}+ years`,
      canonicalValue: null,
      isBlocker: true,
    });
  }

  return reqs;
}

type SourceType = "CONNECTOR" | "AGGREGATOR" | "USER_SUBMITTED" | "MANUAL";
type LegalBasis = "PUBLIC_DOCUMENTED" | "LICENSED_API" | "USER_SESSION";

function sourceTypeForIndex(i: number): SourceType {
  if (i < 180) return "CONNECTOR";
  if (i < 270) return "AGGREGATOR";
  if (i < 365) return "USER_SUBMITTED";
  return "MANUAL";
}

function legalBasisFor(st: SourceType): LegalBasis {
  if (st === "CONNECTOR") return "LICENSED_API";
  if (st === "AGGREGATOR") return "PUBLIC_DOCUMENTED";
  return "USER_SESSION";
}

function postedAtForIndex(i: number): string {
  if (i < 240) return daysAgo(Math.floor(seededRandom() * 7));
  if (i < 340) return daysAgo(7 + Math.floor(seededRandom() * 23));
  return daysAgo(30 + Math.floor(seededRandom() * 60));
}

const ALL_WORK_AUTH: Array<"H1B" | "H4_EAD" | "OPT" | "CPT" | "GC" | "GC_EAD" | "USC" | "TN" | "OTHER"> = [
  "H1B", "H4_EAD", "OPT", "CPT", "GC", "GC_EAD", "USC", "TN",
];

const duplicateTargets = new Set<number>();
while (duplicateTargets.size < 25) {
  duplicateTargets.add(Math.floor(seededRandom() * 375));
}
const dupeArray = [...duplicateTargets];
let dupeIdx = 0;

export const jobsFixture: Job[] = Array.from({ length: 400 }, (_, i) => {
  const template = JD_TEMPLATES[i % JD_TEMPLATES.length]!;
  const company = companiesFixture[i % companiesFixture.length]!;
  const loc = pick(US_CITIES);
  const sourceType = sourceTypeForIndex(i);
  const isRestricted = i < 90;
  const excludesC2C = i >= 90 && i < 160;

  const remoteRoll = seededRandom();
  const remoteMode = remoteRoll < 0.35 ? "REMOTE" as const : remoteRoll < 0.75 ? "HYBRID" as const : "ONSITE" as const;

  const hasApplicantCount = seededRandom() > 0.3;
  const rateBase = 50 + Math.floor(seededRandom() * 60);

  const isDupe = dupeIdx < dupeArray.length && i === dupeArray[dupeIdx]! + 25;
  if (isDupe) dupeIdx++;

  const id = `job_${String(i + 1).padStart(3, "0")}`;

  return {
    id,
    companyId: company.id,
    company,
    title: template.title + (seededRandom() > 0.7 ? " — " + pick(["Remote", "Hybrid", "Contract", "Long Term"]) : ""),
    normalisedTitle: template.normalisedTitle,
    description: template.description,
    city: remoteMode === "REMOTE" ? null : loc.city,
    state: remoteMode === "REMOTE" ? null : loc.state,
    country: "US",
    remoteMode,
    employmentType: pick(["C2C", "W2", "FTE", null] as const),
    rateMin: rateBase,
    rateMax: rateBase + 15 + Math.floor(seededRandom() * 20),
    salaryMin: null,
    salaryMax: null,
    allowedWorkAuth: isRestricted ? ["USC", "GC"] : [...ALL_WORK_AUTH],
    excludesC2C,
    postedAt: postedAtForIndex(i),
    applicantCount: hasApplicantCount ? 5 + Math.floor(seededRandom() * 395) : null,
    applyUrl: `https://${company.domain ?? "example.com"}/careers/${id}`,
    requirements: makeRequirements(template),
    dedupe: {
      urlHash: `urlh_${id}`,
      contentHash: `ctnh_${id}`,
      canonicalUrl: `https://${company.domain ?? "example.com"}/jobs/${id}`,
      duplicateOfJobId: isDupe ? `job_${String(i - 24).padStart(3, "0")}` : null,
    },
    provenance: {
      sourceType,
      sourceId: `src_${sourceType.toLowerCase()}_${i}`,
      sourceUrl: sourceType !== "MANUAL" ? `https://${company.domain ?? "example.com"}/jobs/${id}` : null,
      legalBasis: legalBasisFor(sourceType),
      capturedByUserId: sourceType === "USER_SUBMITTED" || sourceType === "MANUAL"
        ? pick(["user_adnan", "user_sneha", "user_vikram"])
        : null,
      ingestedAt: postedAtForIndex(i),
    },
    isActive: seededRandom() > 0.08,
  };
});

export function getJobById(id: string): Job | undefined {
  return jobsFixture.find((j) => j.id === id);
}
