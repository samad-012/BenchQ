import type { Resume, ResumeVersion, ResumeClaim, AtsIssue } from "@/lib/schemas/resume";
import type { ClaimState } from "@/lib/schemas/enums";
import { candidatesFixture } from "./candidates";
import { recordsFixture } from "./records";
import { daysAgo, resetSeed, seededRandom, pick } from "./_seed";

resetSeed(700);

const ATS_CHECKS: Array<Omit<AtsIssue, "passed">> = [
  { check: "SEMANTIC_HEADINGS", label: "Semantic headings", severity: "BLOCKER", message: "No semantic heading structure detected", fix: "Use standard section headers: Experience, Education, Skills" },
  { check: "TABLE_DETECTED", label: "Tables detected", severity: "IMPORTANT", message: "Tables may not parse correctly in ATS", fix: "Replace tables with plain text formatting" },
  { check: "FONT_COUNT", label: "Font count", severity: "MINOR", message: "More than 2 fonts detected", fix: "Limit to 1-2 professional fonts" },
  { check: "IMAGE_TEXT", label: "Text in images", severity: "BLOCKER", message: "Text embedded in images cannot be parsed", fix: "Replace image text with selectable text" },
  { check: "CONTACT_BLOCK", label: "Contact information", severity: "IMPORTANT", message: "Missing or incomplete contact block", fix: "Include name, email, phone, and location at the top" },
  { check: "DATE_FORMAT", label: "Date format", severity: "MINOR", message: "Inconsistent date formatting", fix: "Use consistent format like 'MMM YYYY'" },
  { check: "SECTION_ORDER", label: "Section ordering", severity: "MINOR", message: "Non-standard section ordering", fix: "Use: Summary, Experience, Education, Skills, Certifications" },
];

function makeAtsIssues(atsScore: number): AtsIssue[] {
  return ATS_CHECKS.map((check) => ({
    ...check,
    passed: atsScore >= 75 ? seededRandom() > 0.2 : seededRandom() > 0.5,
  }));
}

function makeClaims(versionId: string, candidateId: string): ResumeClaim[] {
  const record = recordsFixture.find((r) => r.candidateId === candidateId);
  if (!record) return [];

  const claims: ResumeClaim[] = [];
  let claimIdx = 0;

  if (record.summary) {
    const state: ClaimState = seededRandom() > 0.2 ? "VERIFIED" : "UNVERIFIED";
    claims.push({
      id: `claim_${versionId}_${claimIdx++}`,
      resumeVersionId: versionId,
      section: "summary",
      entityId: null,
      bulletIndex: null,
      text: record.summary,
      state,
      evidenceId: state === "VERIFIED" ? `ev_rec_${candidateId}_summary` : null,
      reason: state === "UNVERIFIED" ? "Summary drafted by AI — needs candidate review" : null,
      overriddenByUserId: null,
      overrideReason: null,
      overriddenAt: null,
    });
  }

  for (const exp of record.experiences) {
    for (let bi = 0; bi < exp.bullets.length; bi++) {
      const bullet = exp.bullets[bi]!;
      claims.push({
        id: `claim_${versionId}_${claimIdx++}`,
        resumeVersionId: versionId,
        section: "experience",
        entityId: exp.id,
        bulletIndex: bi,
        text: bullet.text,
        state: bullet.state,
        evidenceId: bullet.evidenceId,
        reason: bullet.state === "UNVERIFIED"
          ? pick(["No evidence on record for team size — needs candidate confirmation", "Metric unverified — source document doesn't mention percentage", "AI-generated bullet — human review required"])
          : bullet.state === "CONTRADICTED"
            ? pick(["Contradicted by prior resume version", "No certificate on file; candidate confirmed not held", "Timeline inconsistent with employment record"])
            : null,
        overriddenByUserId: null,
        overrideReason: null,
        overriddenAt: null,
      });
    }
  }

  return claims;
}

function makeVersion(
  resumeId: string,
  candidateId: string,
  versionNum: number,
  parentVersionId: string | null,
): ResumeVersion {
  // Tailored copies get their own id space so a version id always names exactly one resume.
  const id = resumeId.endsWith("_master") ? `rv_${candidateId}_${versionNum}` : `rv_${candidateId}_t${versionNum}`;
  const atsScore = seededRandom() > 0.15 ? 75 + Math.floor(seededRandom() * 21) : 45 + Math.floor(seededRandom() * 30);
  const claims = makeClaims(id, candidateId);
  const keywords = ["Java", "Spring Boot", "AWS", "Kubernetes", "Python", "React", "SQL", "Agile"];
  const matched = keywords.filter(() => seededRandom() > 0.3);
  const missing = keywords.filter((k) => !matched.includes(k));

  const hasTailoring = seededRandom() > 0.5;
  const hasTracer = seededRandom() > 0.85;

  return {
    id,
    resumeId,
    versionNumber: versionNum,
    parentVersionId,
    templateId: pick(["template_modern", "template_classic", "template_minimal"]),
    includedSectionIds: ["summary", "experience", "education", "skills"],
    includedBulletIds: claims.filter((c) => c.section === "experience").map((c) => c.id),
    bulletOverrides: {},
    atsScore,
    atsGrade: atsScore >= 90 ? "A" : atsScore >= 80 ? "B" : atsScore >= 75 ? "C" : atsScore >= 60 ? "D" : "F",
    atsIssues: makeAtsIssues(atsScore),
    keywordScore: Math.floor((matched.length / keywords.length) * 100),
    keywordsMatched: matched,
    keywordsMissing: missing,
    claims,
    tailoring: hasTailoring ? {
      targetJobId: `job_${String(1 + Math.floor(seededRandom() * 400)).padStart(3, "0")}`,
      targetJobTitle: pick(["Senior Java Developer", "Data Engineer", "DevOps Engineer", "React Developer"]),
      targetCompanyName: pick(["JPMorgan Chase", "Capital One", "Deloitte", "Accenture"]),
      keywordsTargeted: matched.slice(0, 3),
      bulletsRewritten: 2 + Math.floor(seededRandom() * 5),
      generatedBy: pick(["HUMAN", "AGENT"]),
      modelId: seededRandom() > 0.5 ? "claude-sonnet-5" : null,
      promptVersion: seededRandom() > 0.5 ? "v2.1" : null,
      generatedAt: daysAgo(Math.floor(seededRandom() * 14)),
    } : null,
    tracer: hasTracer ? {
      token: `trc_${id}`,
      url: `https://track.benchq.app/t/${id}`,
      openCount: 1 + Math.floor(seededRandom() * 5),
      clickCount: Math.floor(seededRandom() * 3),
      firstOpenedAt: daysAgo(Math.floor(1 + seededRandom() * 5)),
      lastOpenedAt: daysAgo(Math.floor(seededRandom() * 2)),
    } : null,
    pdfUrl: null,
    docxUrl: null,
    renderedAt: daysAgo(Math.floor(seededRandom() * 7)),
    changeSummary: versionNum > 1 ? pick(["Tailored for fintech role", "Updated skills section", "Added recent project", null]) : "Initial version",
    createdByUserId: pick(["user_adnan", "user_sneha", "user_vikram"]),
    createdAt: daysAgo(Math.floor(seededRandom() * 30)),
  };
}

export const resumesFixture: Resume[] = [];

for (const candidate of candidatesFixture) {
  if (candidate.status === "INACTIVE") continue;

  const masterResumeId = `resume_${candidate.id}_master`;
  const versionCount = 1 + Math.floor(seededRandom() * 3);
  const versions: ResumeVersion[] = [];

  for (let v = 1; v <= versionCount; v++) {
    versions.push(makeVersion(masterResumeId, candidate.id, v, v > 1 ? `rv_${candidate.id}_${v - 1}` : null));
  }

  resumesFixture.push({
    id: masterResumeId,
    candidateId: candidate.id,
    name: "Master Resume",
    isMaster: true,
    targetJobId: null,
    templateId: versions[0]!.templateId,
    versions,
    latestVersionId: versions[versions.length - 1]!.id,
  });

  if (seededRandom() > 0.5) {
    const tailoredId = `resume_${candidate.id}_tailored`;
    const tv = makeVersion(tailoredId, candidate.id, 1, null);
    resumesFixture.push({
      id: tailoredId,
      candidateId: candidate.id,
      name: `Tailored — ${pick(["Fintech", "Healthcare", "Consulting", "Enterprise"])}`,
      isMaster: false,
      targetJobId: `job_${String(1 + Math.floor(seededRandom() * 400)).padStart(3, "0")}`,
      templateId: tv.templateId,
      versions: [tv],
      latestVersionId: tv.id,
    });
  }
}

export function resumesByCandidate(candidateId: string): Resume[] {
  return resumesFixture.filter((r) => r.candidateId === candidateId);
}
