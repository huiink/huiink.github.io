import rawFriends from "./friends.md?raw";

export type Friend = {
	name: string;
	url: string;
	desc: string;
	image: string;
};

const requiredFields: Array<keyof Friend> = ["name", "url", "desc", "image"];

function normalizeValue(value: string): string {
	const trimmed = value.trim();
	const quote = trimmed[0];

	if (
		(quote === '"' || quote === "'") &&
		trimmed.endsWith(quote) &&
		trimmed.length >= 2
	) {
		return trimmed.slice(1, -1);
	}

	return trimmed;
}

function assertFriend(value: Partial<Friend>, index: number): Friend {
	for (const field of requiredFields) {
		if (!value[field]) {
			throw new Error(`Friend entry ${index + 1} is missing "${field}"`);
		}
	}

	return value as Friend;
}

export function parseFriends(source: string): Friend[] {
	const friends: Array<Partial<Friend>> = [];

	for (const rawLine of source.split(/\r?\n/)) {
		const line = rawLine.trim();
		if (!line || line.startsWith("#")) continue;

		const itemMatch = line.match(/^-\s+(\w+):\s*(.*)$/);
		const fieldMatch = line.match(/^(\w+):\s*(.*)$/);
		const match = itemMatch ?? fieldMatch;

		if (!match) {
			throw new Error(`Invalid friends.md line: ${rawLine}`);
		}

		if (itemMatch) friends.push({});
		if (friends.length === 0) {
			throw new Error("friends.md must start with a list item");
		}

		const key = match[1] as keyof Friend;
		if (!requiredFields.includes(key)) {
			throw new Error(`Unsupported friends.md field: ${match[1]}`);
		}

		friends[friends.length - 1][key] = normalizeValue(match[2]);
	}

	return friends.map(assertFriend);
}

export const friends = parseFriends(rawFriends);
