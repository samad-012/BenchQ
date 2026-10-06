import { arrayOf } from "@/lib/api/client";
import { RecordSchema, type Record_ } from "@/lib/schemas/record";
import recordsSeed from "./data/records.json";
import { mockResult, notFound } from "./_shared";

const records: Record_[] = arrayOf(RecordSchema).parse(recordsSeed);

export const recordsMock = {
  byCandidate: (candidateId: string): Promise<Record_> =>
    mockResult(records.find((item) => item.candidateId === candidateId) ?? notFound("Candidate record", candidateId)),
};
