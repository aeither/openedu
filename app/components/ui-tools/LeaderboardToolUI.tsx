import { cn } from "@/lib/utils";
import { makeAssistantToolUI } from "@assistant-ui/react";

type LeaderboardArgs = {
  limit: number;
};

type LeaderboardResult = {
  leaderboard: Array<{
    address: string;
    points: string;
    rank: number;
  }>;
};

export const LeaderboardToolUI = makeAssistantToolUI<
	LeaderboardArgs,
	LeaderboardResult
>({
	toolName: "getLeaderboardTool",
	render: ({ args, status, result }) => {
		// Loading state
		if (status.type === "running") {
			const loadingItems = Array.from({ length: args.limit || 5 }, (_, i) => i);
			
			return (
				<div className="animate-pulse bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 max-w-full">
					<div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4" />
					{loadingItems.map((item) => (
						<div key={`loading-item-${item}`} className="flex items-center mb-3">
							<div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full mr-3" />
							<div className="flex-1">
								<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
								<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
							</div>
						</div>
					))}
				</div>
			);
		}

		// Result state
		if (status.type === "complete" && result) {
			const { leaderboard } = result;

			return (
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 max-w-full">
					<h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
						Top {leaderboard.length} Users Leaderboard
					</h3>

					<div className="overflow-hidden">
						<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
							<thead className="bg-gray-50 dark:bg-gray-900">
								<tr>
									<th
										scope="col"
										className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
									>
										Rank
									</th>
									<th
										scope="col"
										className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
									>
										Wallet
									</th>
									<th
										scope="col"
										className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
									>
										XP
									</th>
								</tr>
							</thead>
							<tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
								{leaderboard.map((user) => {
									// Format address to show first 6 and last 4 characters
									const displayAddress = `${user.address.substring(0, 6)}...${user.address.substring(user.address.length - 4)}`;

									return (
										<tr
											key={user.address}
											className="hover:bg-gray-50 dark:hover:bg-gray-700"
										>
											<td className="px-4 py-3 whitespace-nowrap">
												<div
													className={cn(
														"inline-flex items-center justify-center h-6 w-6 rounded-full text-xs font-medium",
														user.rank === 1
															? "bg-yellow-100 text-yellow-800"
															: user.rank === 2
																? "bg-gray-100 text-gray-800"
																: user.rank === 3
																	? "bg-amber-100 text-amber-800"
																	: "bg-blue-50 text-blue-700",
													)}
												>
													{user.rank}
												</div>
											</td>
											<td className="px-4 py-3 whitespace-nowrap">
												<div className="text-sm font-medium text-gray-900 dark:text-white">
													{displayAddress}
												</div>
											</td>
											<td className="px-4 py-3 whitespace-nowrap">
												<div className="text-sm text-blue-600 dark:text-blue-400 font-bold">
													{Number.parseFloat(user.points).toLocaleString()} XP
												</div>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				</div>
			);
		}

		// Error state
		if (status.type === "incomplete") {
			return (
				<div className="bg-red-50 dark:bg-red-900 border-l-4 border-red-500 p-4">
					<div className="flex">
						<div className="shrink-0">
							{/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
							<svg
								className="h-5 w-5 text-red-500"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fillRule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
									clipRule="evenodd"
								/>
							</svg>
						</div>
						<div className="ml-3">
							<p className="text-sm text-red-700 dark:text-red-200">
								Failed to load leaderboard: {status.reason}
							</p>
						</div>
					</div>
				</div>
			);
		}

		// Initial state
		return (
			<div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
				<p className="text-sm text-gray-500 dark:text-gray-400">
					Loading leaderboard (top {args.limit || 10} users)...
				</p>
			</div>
		);
	},
});
