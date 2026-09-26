import { describe, expect, it } from "vitest";
import { applicationsFixture } from "@/mocks/fixtures/applications";
import { candidatesFixture } from "@/mocks/fixtures/candidates";
import { resumesFixture } from "@/mocks/fixtures/resumes";
import { deriveCandidateStats } from "./candidate-stats";
import { deriveExportGate } from "./export-gate";
import { deriveFunnel } from "./funnel";

describe("deriveCandidateStats", () => {
  it("derives counts from applications instead of stored summary values", () => {
    const candidate = candidatesFixture[0]!;
    const applications = applicationsFixture.filter(
      (application) => application.candidateId === candidate.id,
    );
    const submitted = applications.filter(
      (application) => application.status !== "SAVED",
    );

    const stats = deriveCandidateStats(candidate, applications);

    expect(stats.applicationsSubmitted).toBe(submitted.length);
    expect(stats.distinctCompanies).toBe(
      new Set(submitted.map((application) => application.companyNameAtApply)).size,
    );
    expect(stats.responsesReceived).toBe(
      submitted.filter((application) => application.firstResponseAt).length,
    );
  });

  it("returns safe zero values for a candidate with no applications", () => {
    const candidate = candidatesFixture[0]!;
    const stats = deriveCandidateStats(candidate, []);

    expect(stats.applicationsSubmitted).toBe(0);
    expect(stats.responseRatePct).toBe(0);
    expect(stats.firstApplicationAt).toBeNull();
  });
});

describe("deriveExportGate", () => {
  const version = resumesFixture[0]!.versions[0]!;

  it("blocks export when any claim remains as unverified", () => {
    const result = deriveExportGate({
      ...version,
      claims: version.claims.map((claim, index) => ({
        ...claim,
        state: index === 0 ? "UNVERIFIED" : "VERIFIED",
        evidenceId: index === 0 ? null : claim.evidenceId,
      })),
    });

    expect(result.canExport).toBe(false);
    expect(result.unverifiedCount).toBe(1);
    expect(result.blockingClaimIds).toHaveLength(1);
  });

  it("allows export when contradicted claims are excluded and no unverified remains", () => {
    const result = deriveExportGate({
      ...version,
      claims: version.claims.map((claim, index) => ({
        ...claim,
        state: index === 0 ? "CONTRADICTED" : "VERIFIED",
      })),
    });

    expect(result.canExport).toBe(true);
    expect(result.contradictedCount).toBe(1);
    expect(result.blockingClaimIds).toEqual([]);
  });
});

describe("deriveFunnel", () => {
  it("counts every stage reached in the event history", () => {
    const funnel = deriveFunnel(applicationsFixture);

    expect(funnel.map((stage) => stage.label)).toEqual([
      "Applied",
      "Response",
      "Screening",
      "Interview",
      "Offer",
      "Placed",
    ]);
    expect(funnel.every((stage, index) => index === 0 || stage.count <= funnel[index - 1]!.count)).toBe(true);
  });
});
