import { runs } from "@trigger.dev/sdk/v3";
import * as dotenv from "dotenv";
dotenv.config();

export async function getUserTasks(chatId: string) {
    // const run = await runs.retrieve("run_x539mhq8i1m98ihy38opp")
    // console.log("🚀 ~ getUserTasks ~ run:", run)

    const allRuns = await runs.list({ limit: 100 })
    console.log("🚀 ~ getUserTasks ~ allRuns:", allRuns)
//   const userRuns = [];
//   for await (const run of runs.list({ limit: 100 })) {
//     // Filter by chatId in payload
//     if ((run as any).payload?.chatId === chatId) {
//       userRuns.push(run);
//     }
//   }
//   return userRuns;
}

getUserTasks('1234567890').then(console.log);