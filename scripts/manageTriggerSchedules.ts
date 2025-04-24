import { schedules } from "@trigger.dev/sdk/v3";
import dotenv from "dotenv";
dotenv.config();

// List all schedules
async function listSchedules() {
    const allSchedules = await schedules.list();
    console.log("Schedules:");
    for await (const schedule of allSchedules) {
        console.log(`ID: ${schedule.id}, Task: ${schedule.task}, Active: ${schedule.active}, Next Run: ${schedule.nextRun}`);
    }
    return allSchedules;
}

// Delete a schedule by ID
async function deleteSchedule(scheduleId: string) {
    await schedules.del(scheduleId);
    console.log(`Deleted schedule: ${scheduleId}`);
}

// Example usage
(async () => {
    // List all schedules
    const schedulesList = await listSchedules();

    // Delete the first schedule in the list as an example
    if (schedulesList.data.length > 0) {
        const scheduleId = schedulesList.data[0].id;
        await deleteSchedule(scheduleId);
    } else {
        console.log("No schedules found to delete.");
    }
})();
