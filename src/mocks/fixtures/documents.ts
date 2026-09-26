import type { CandidateDocument } from "@/lib/schemas/document";
import type { WorkAuth } from "@/lib/schemas/enums";
import { candidatesFixture } from "./candidates";
import { recordsFixture } from "./records";
import { daysAgo, daysFromNow, pick, resetSeed, seededRandom } from "./_seed";

resetSeed(1100);

const VISA_DOC: Record<WorkAuth, { title: string; file: string } | null> = {
  H1B: { title: "H-1B approval notice (I-797)", file: "I-797_H1B_Approval.pdf" },
  H4_EAD: { title: "H4 EAD card", file: "H4_EAD_Card.pdf" },
  OPT: { title: "OPT EAD card", file: "OPT_EAD_Card.pdf" },
  CPT: { title: "CPT authorization (I-20)", file: "I-20_CPT.pdf" },
  GC: { title: "Green Card", file: "Green_Card.pdf" },
  GC_EAD: { title: "GC EAD card", file: "GC_EAD_Card.pdf" },
  USC: { title: "US passport", file: "US_Passport.pdf" },
  TN: { title: "TN visa (I-94)", file: "TN_I-94.pdf" },
  OTHER: null,
};

const slug = (name: string) => name.replace(/\s+/g, "_");
const share = (id: string) => `https://files.benchq.app/s/${id}`;

export const documentsFixture: CandidateDocument[] = [];

for (const candidate of candidatesFixture) {
  const record = recordsFixture.find((r) => r.candidateId === candidate.id);
  const owner = candidate.primaryUserId ?? "user_adnan";
  const add = (doc: Omit<CandidateDocument, "candidateId" | "uploadedByUserId" | "shareUrl">) =>
    documentsFixture.push({ ...doc, candidateId: candidate.id, uploadedByUserId: owner, shareUrl: share(doc.id) });

  // The id matches RecordEvidence.documentId, so the original resume "backs" verified claims.
  add({ id: `doc_rec_${candidate.id}_resume`, kind: "RESUME", title: "Original resume", fileName: `${slug(candidate.fullName)}_Resume.pdf`, mimeType: "application/pdf", sizeKb: 180 + Math.floor(seededRandom() * 220), uploadedAt: daysAgo(30 + Math.floor(seededRandom() * 40)), expiresAt: null });

  const visa = VISA_DOC[candidate.workAuth];
  if (visa) {
    // One in four candidates has a visa paper close to expiry, so the reminder is demoable.
    const expiresAt = candidate.workAuth === "USC" || candidate.workAuth === "GC" ? daysFromNow(900 + Math.floor(seededRandom() * 1500)) : seededRandom() < 0.25 ? daysFromNow(20 + Math.floor(seededRandom() * 40)) : (candidate.workAuthExpiry ?? null);
    add({ id: `doc_${candidate.id}_visa`, kind: "WORK_AUTH", title: visa.title, fileName: visa.file, mimeType: "application/pdf", sizeKb: 300 + Math.floor(seededRandom() * 500), uploadedAt: daysAgo(20 + Math.floor(seededRandom() * 60)), expiresAt });
  }

  if (seededRandom() > 0.2) {
    add({ id: `doc_${candidate.id}_id`, kind: "IDENTITY", title: "Driver's license", fileName: "Drivers_License.jpg", mimeType: "image/jpeg", sizeKb: 900 + Math.floor(seededRandom() * 1600), uploadedAt: daysAgo(25 + Math.floor(seededRandom() * 50)), expiresAt: daysFromNow(200 + Math.floor(seededRandom() * 1200)) });
  }

  for (const cert of record?.certificates ?? []) {
    add({ id: `doc_${cert.id}`, kind: "CERTIFICATION", title: cert.name, fileName: `${slug(cert.name)}.pdf`, mimeType: "application/pdf", sizeKb: 120 + Math.floor(seededRandom() * 200), uploadedAt: daysAgo(10 + Math.floor(seededRandom() * 80)), expiresAt: cert.expiryDate });
  }

  const edu = record?.educations[0];
  if (edu && seededRandom() > 0.35) {
    add({ id: `doc_${edu.id}`, kind: "EDUCATION", title: `${edu.degree ?? "Degree"} certificate`, fileName: "Degree_Certificate.pdf", mimeType: "application/pdf", sizeKb: 400 + Math.floor(seededRandom() * 600), uploadedAt: daysAgo(40 + Math.floor(seededRandom() * 60)), expiresAt: null });
  }

  if (seededRandom() > 0.5) {
    const letter = pick(["Experience letter", "Relieving letter", "Recent pay stub"]);
    add({ id: `doc_${candidate.id}_employment`, kind: "EMPLOYMENT", title: letter, fileName: `${slug(letter)}.pdf`, mimeType: "application/pdf", sizeKb: 90 + Math.floor(seededRandom() * 150), uploadedAt: daysAgo(15 + Math.floor(seededRandom() * 60)), expiresAt: null });
  }
}
