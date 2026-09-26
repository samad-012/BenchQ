import { delay, http, HttpResponse } from "msw";
import { TailorResumeInputSchema } from "@/lib/schemas/agent";
import { RewriteInputSchema } from "@/lib/schemas/resume-document";
import { simulateRewrite } from "@/mocks/fixtures/ai-rewrites";
import type { ResumeClaim } from "@/lib/schemas/resume";
import { seededRandom } from "@/mocks/fixtures/_seed";

const STAGES = [
  "Reading the candidate record",
  "Extracting job requirements",
  "Matching evidence",
  "Drafting tailored claims",
];

function draftClaims(resumeVersionId: string): ResumeClaim[] {
  return [
    {
      id: `agent_${resumeVersionId}_summary`,
      resumeVersionId,
      section: "summary",
      entityId: null,
      bulletIndex: null,
      text: "Senior engineer focused on reliable delivery across cloud-native platforms.",
      state: "UNVERIFIED",
      evidenceId: null,
      reason: "AI-drafted summary requires evidence review.",
      overriddenByUserId: null,
      overrideReason: null,
      overriddenAt: null,
    },
    {
      id: `agent_${resumeVersionId}_experience`,
      resumeVersionId,
      section: "experience",
      entityId: null,
      bulletIndex: 0,
      text: "Improved deployment reliability by standardising automated release workflows.",
      state: "UNVERIFIED",
      evidenceId: null,
      reason: "The outcome is plausible but no supporting evidence is linked yet.",
      overriddenByUserId: null,
      overrideReason: null,
      overriddenAt: null,
    },
  ];
}

export const agentsHandlers = [
  http.post("/api/agents/rewrite", async ({ request }) => {
    const parsed = RewriteInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return HttpResponse.json({ error: "INVALID_AGENT_INPUT", message: "Select some text to rewrite." }, { status: 400 });
    }
    await delay(900 + Math.floor(seededRandom() * 900));
    if (seededRandom() < 0.03) {
      return HttpResponse.json({ error: "AGENT_UNAVAILABLE", message: "AI rewrite is unavailable. Edit the text manually." }, { status: 503 });
    }
    return HttpResponse.json(simulateRewrite(parsed.data.text, parsed.data.action));
  }),

  http.post("/api/agents/tailor-resume", async ({ request }) => {
    const parsed = TailorResumeInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return HttpResponse.json(
        {
          error: "INVALID_AGENT_INPUT",
          message: "Choose a resume and job before tailoring.",
        },
        { status: 400 },
      );
    }

    const latency = 2_000 + Math.floor(seededRandom() * 3_001);
    await delay(latency);

    if (seededRandom() < 0.05) {
      return HttpResponse.json(
        {
          error: "AGENT_UNAVAILABLE",
          message: "AI tailoring is unavailable. Continue with the manual editor.",
        },
        { status: 503 },
      );
    }

    const { resumeVersionId, jobId } = parsed.data;
    return HttpResponse.json({
      runId: `run_${resumeVersionId}_${jobId}`,
      resumeVersionId,
      jobId,
      stages: STAGES,
      claims: draftClaims(resumeVersionId),
      generatedAt: new Date().toISOString(),
    });
  }),
];
