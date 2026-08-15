import type {
	ExpressiveCodeConfig,
	LicenseConfig,
	NavBarConfig,
	ProfileConfig,
	SiteConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";

export const siteConfig: SiteConfig = {
	title: "huiink's blog",
	subtitle: "保障每天三小時的睡眠",
	lang: "zh_TW", // Language code, e.g. 'en', 'zh_CN', 'ja', etc.
	themeColor: {
		hue: 210, // Default hue for the theme color, from 0 to 360. e.g. red: 0, teal: 200, cyan: 250, pink: 345
		fixed: false, // Hide the theme color picker for visitors
	},
	banner: {
		enable: true,
		src: "/cover.webp", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
		position: "center", // Equivalent to object-position, only supports 'top', 'center', 'bottom'. 'center' by default
		credit: {
			enable: false, // Display the credit text of the banner image
			text: "", // Credit text to be displayed
			url: "", // (Optional) URL link to the original artwork or artist's page
		},
	},
	toc: {
		enable: true, // Display the table of contents on the right side of the post
		depth: 2, // Maximum heading depth to show in the table, from 1 to 3
	},
	favicon: [
		// Leave this array empty to use the default favicon
		// {
		//   src: '/favicon/icon.png',    // Path of the favicon, relative to the /public directory
		//   theme: 'light',              // (Optional) Either 'light' or 'dark', set only if you have different favicons for light and dark mode
		//   sizes: '32x32',              // (Optional) Size of the favicon, set only if you have favicons of different sizes
		// }
	],
};

export const navBarConfig: NavBarConfig = {
	links: [
		LinkPreset.Home,
		LinkPreset.Archive,
		LinkPreset.About,
		{
			name: "友鏈",
			url: "/friends/",
		},
	],
};

export const profileConfig: ProfileConfig = {
	avatar: "/avatar.webp", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
	name: "老祖",
	bio: "保障每天三小時的睡眠",
	links: [
		{
			name: "IG",
			icon: "fa6-brands:instagram",
			url: "https://www.instagram.com/hui.ink_730/",
		},
		{
			name: "Steam",
			icon: "fa6-brands:steam",
			url: "https://steamcommunity.com/id/h0730/",
		},
		{
			name: "GitHub",
			icon: "fa6-brands:github",
			url: "https://github.com/huiink",
		},
		{
			name: "Email",
			icon: "fa6-solid:envelope",
			url: "mailto:huanghongjunh2@gmail.com",
		},
		{
			name: "DC",
			icon: "fa6-brands:discord",
			url: "https://discord.com/users/1124244726913179679",
		},
	],
};

export const licenseConfig: LicenseConfig = {
	enable: true,
	name: "CC BY-NC-SA 4.0",
	url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};

export const expressiveCodeConfig: ExpressiveCodeConfig = {
	// Note: Some styles (such as background color) are being overridden, see the astro.config.mjs file.
	// Please select a dark theme, as this blog theme currently only supports dark background color
	theme: "github-dark",
};
