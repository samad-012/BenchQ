import { candidatesHandlers } from "./candidates";
import { companiesHandlers } from "./companies";
import { jobsHandlers } from "./jobs";
import { applicationsHandlers, followupsHandlers } from "./applications";
import { recordsHandlers } from "./records";
import { resumesHandlers } from "./resumes";
import { sessionHandlers } from "./session";
import { ledgerHandlers } from "./ledger";
import { agentsHandlers } from "./agents";
import { teamHandlers } from "./team";
import { inboxHandlers } from "./inbox";
import { documentsHandlers } from "./documents";

export const handlers = [
  ...candidatesHandlers,
  ...companiesHandlers,
  ...jobsHandlers,
  ...applicationsHandlers,
  ...followupsHandlers,
  ...recordsHandlers,
  ...resumesHandlers,
  ...sessionHandlers,
  ...ledgerHandlers,
  ...agentsHandlers,
  ...teamHandlers,
  ...inboxHandlers,
  ...documentsHandlers,
];
