import { arrayOf } from "@/lib/api/client";
import { ResumeSchema, type Resume } from "@/lib/schemas/resume";
import resumesSeed from "./data/resumes.json";
import { mockResult, notFound } from "./_shared";

const resumes: Resume[] = arrayOf(ResumeSchema).parse(resumesSeed);

export const resumesMock = {
  list: (): Promise<Resume[]> => mockResult(resumes),

  byCandidate: (candidateId: string): Promise<Resume[]> =>
    mockResult(resumes.filter((resume) => resume.candidateId === candidateId)),

  byId: (id: string): Promise<Resume> =>
    mockResult(resumes.find((item) => item.id === id) ?? notFound("Resume", id)),
};
