import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Keep "No end date" BnBs showing the next 12 months as days pass.
// 21:05 UTC = 00:05 in Kenya, just after midnight.
crons.daily(
    "refresh no-end-date BnBs",
    { hourUTC: 21, minuteUTC: 5 },
    internal.properties.refreshOpenEndedBnbs
);

export default crons;