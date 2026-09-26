import { delay, http, HttpResponse } from "msw";
import { documentsFixture } from "@/mocks/fixtures/documents";
import { UploadDocumentSchema } from "@/lib/schemas/document";
import { respond } from "./_util";

export const documentsHandlers = [
  http.get("/api/candidates/:candidateId/documents", ({ params }) =>
    respond(documentsFixture.filter((d) => d.candidateId === params.candidateId)),
  ),

  // Metadata only — the mock never receives file bytes.
  http.post("/api/candidates/:candidateId/documents", async ({ params, request }) => {
    const parsed = UploadDocumentSchema.safeParse(await request.json());
    if (!parsed.success) {
      return HttpResponse.json({ error: "INVALID_DOCUMENT", message: "Choose a document type and a title before saving." }, { status: 400 });
    }
    await delay(700);
    const id = `doc_upload_${Date.now().toString(36)}`;
    const doc = { ...parsed.data, id, candidateId: String(params.candidateId), uploadedAt: new Date().toISOString(), uploadedByUserId: "user_adnan", shareUrl: `https://files.benchq.app/s/${id}` };
    documentsFixture.unshift(doc);
    return respond(doc);
  }),

  http.delete("/api/documents/:id", ({ params }) => {
    const index = documentsFixture.findIndex((d) => d.id === params.id);
    if (index < 0) return HttpResponse.json({ error: "NOT_FOUND", message: "Document not found." }, { status: 404 });
    const [removed] = documentsFixture.splice(index, 1);
    return respond(removed!);
  }),
];
