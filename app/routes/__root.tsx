import appCss from "@/app.css?url";
import { Header } from "@/components/Header";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import type { TRPCOptionsProxy } from "@trpc/tanstack-react-query";
import type * as React from "react";
import { DefaultCatchBoundary } from "../components/DefaultCatchBoundary";
import { NotFound } from "../components/NotFound";
import { WagmiRainbowKitProvider } from "../providers/wagmi";
import type { TRPCRouter } from "../trpc/router";

// Prevent theme flash script
const themeScript = `
  let theme = localStorage.getItem('vite-ui-theme');
  if (!theme) {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      theme = 'dark';
    } else {
      theme = 'light';
    }
  }
  document.documentElement.classList.add(theme);
  
  // Fix iOS white background in dark mode when keyboard opens
  if (theme === 'dark') {
    // Force background color on the entire body and html elements
    document.body.style.backgroundColor = 'hsl(var(--background))';
    document.documentElement.style.backgroundColor = 'hsl(var(--background))';
  }
`;

export const Route = createRootRouteWithContext<{
	queryClient: QueryClient;
	trpc: TRPCOptionsProxy<TRPCRouter>;
}>()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1" },
		],
		links: [{ rel: "stylesheet", href: appCss }],
		scripts: [{ children: themeScript }],
	}),
	errorComponent: (props) => {
		return (
			<RootDocument>
				<DefaultCatchBoundary {...props} />
			</RootDocument>
		);
	},
	notFoundComponent: () => <NotFound />,
	component: () => (
		<RootDocument>
			<Outlet />
		</RootDocument>
	),
});

function RootDocument(props: Readonly<{ children: React.ReactNode }>) {
	return (
		// biome-ignore lint/a11y/useHtmlLang: <explanation>
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body className="flex flex-col min-h-screen">
				<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
				<WagmiRainbowKitProvider>
					<Header />
					<div className="pt-16">
						{props.children}
					</div>
					{/* {process.env.NODE_ENV === 'development' && (
						<>
							<TanStackRouterDevtools position="bottom-right" />
							<ReactQueryDevtools buttonPosition="bottom-left" />
						</>
					)} */}
					<Toaster />
				</WagmiRainbowKitProvider>
				</ThemeProvider>
				<Scripts />
			</body>
		</html>
	);
}
