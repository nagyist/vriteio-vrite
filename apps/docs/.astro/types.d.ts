declare module 'astro:content' {
	interface Render {
		'.mdx': Promise<{
			Content: import('astro').MarkdownInstance<{}>['Content'];
			headings: import('astro').MarkdownHeading[];
			remarkPluginFrontmatter: Record<string, any>;
		}>;
	}
}

declare module 'astro:content' {
	interface Render {
		'.md': Promise<{
			Content: import('astro').MarkdownInstance<{}>['Content'];
			headings: import('astro').MarkdownHeading[];
			remarkPluginFrontmatter: Record<string, any>;
		}>;
	}
}

declare module 'astro:content' {
	type Flatten<T> = T extends { [K: string]: infer U } ? U : never;

	export type CollectionKey = keyof AnyEntryMap;
	export type CollectionEntry<C extends CollectionKey> = Flatten<AnyEntryMap[C]>;

	export type ContentCollectionKey = keyof ContentEntryMap;
	export type DataCollectionKey = keyof DataEntryMap;

	type AllValuesOf<T> = T extends any ? T[keyof T] : never;
	type ValidContentEntrySlug<C extends keyof ContentEntryMap> = AllValuesOf<
		ContentEntryMap[C]
	>['slug'];

	export function getEntryBySlug<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		// Note that this has to accept a regular string too, for SSR
		entrySlug: E
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;

	export function getDataEntryById<C extends keyof DataEntryMap, E extends keyof DataEntryMap[C]>(
		collection: C,
		entryId: E
	): Promise<CollectionEntry<C>>;

	export function getCollection<C extends keyof AnyEntryMap, E extends CollectionEntry<C>>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => entry is E
	): Promise<E[]>;
	export function getCollection<C extends keyof AnyEntryMap>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => unknown
	): Promise<CollectionEntry<C>[]>;

	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(entry: {
		collection: C;
		slug: E;
	}): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(entry: {
		collection: C;
		id: E;
	}): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		slug: E
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(
		collection: C,
		id: E
	): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;

	/** Resolve an array of entry references from the same collection */
	export function getEntries<C extends keyof ContentEntryMap>(
		entries: {
			collection: C;
			slug: ValidContentEntrySlug<C>;
		}[]
	): Promise<CollectionEntry<C>[]>;
	export function getEntries<C extends keyof DataEntryMap>(
		entries: {
			collection: C;
			id: keyof DataEntryMap[C];
		}[]
	): Promise<CollectionEntry<C>[]>;

	export function reference<C extends keyof AnyEntryMap>(
		collection: C
	): import('astro/zod').ZodEffects<
		import('astro/zod').ZodString,
		C extends keyof ContentEntryMap
			? {
					collection: C;
					slug: ValidContentEntrySlug<C>;
				}
			: {
					collection: C;
					id: keyof DataEntryMap[C];
				}
	>;
	// Allow generic `string` to avoid excessive type errors in the config
	// if `dev` is not running to update as you edit.
	// Invalid collection names will be caught at build time.
	export function reference<C extends string>(
		collection: C
	): import('astro/zod').ZodEffects<import('astro/zod').ZodString, never>;

	type ReturnTypeOrOriginal<T> = T extends (...args: any[]) => infer R ? R : T;
	type InferEntrySchema<C extends keyof AnyEntryMap> = import('astro/zod').infer<
		ReturnTypeOrOriginal<Required<ContentConfig['collections'][C]>['schema']>
	>;

	type ContentEntryMap = {
		"api": {
"authentication.md": {
	id: "authentication.md";
  slug: "api/authentication";
  body: string;
  collection: "api";
  data: InferEntrySchema<"api">
} & { render(): Render[".md"] };
"content-groups.mdx": {
	id: "content-groups.mdx";
  slug: "api/content-groups";
  body: string;
  collection: "api";
  data: InferEntrySchema<"api">
} & { render(): Render[".mdx"] };
"content-pieces.mdx": {
	id: "content-pieces.mdx";
  slug: "api/content-pieces";
  body: string;
  collection: "api";
  data: InferEntrySchema<"api">
} & { render(): Render[".mdx"] };
"extension.mdx": {
	id: "extension.mdx";
  slug: "api/extension";
  body: string;
  collection: "api";
  data: InferEntrySchema<"api">
} & { render(): Render[".mdx"] };
"profile.mdx": {
	id: "profile.mdx";
  slug: "api/profile";
  body: string;
  collection: "api";
  data: InferEntrySchema<"api">
} & { render(): Render[".mdx"] };
"roles.mdx": {
	id: "roles.mdx";
  slug: "api/roles";
  body: string;
  collection: "api";
  data: InferEntrySchema<"api">
} & { render(): Render[".mdx"] };
"search.mdx": {
	id: "search.mdx";
  slug: "api/search";
  body: string;
  collection: "api";
  data: InferEntrySchema<"api">
} & { render(): Render[".mdx"] };
"tags.mdx": {
	id: "tags.mdx";
  slug: "api/tags";
  body: string;
  collection: "api";
  data: InferEntrySchema<"api">
} & { render(): Render[".mdx"] };
"transformers.mdx": {
	id: "transformers.mdx";
  slug: "api/transformers";
  body: string;
  collection: "api";
  data: InferEntrySchema<"api">
} & { render(): Render[".mdx"] };
"user-settings.mdx": {
	id: "user-settings.mdx";
  slug: "api/user-settings";
  body: string;
  collection: "api";
  data: InferEntrySchema<"api">
} & { render(): Render[".mdx"] };
"variants.mdx": {
	id: "variants.mdx";
  slug: "api/variants";
  body: string;
  collection: "api";
  data: InferEntrySchema<"api">
} & { render(): Render[".mdx"] };
"webhooks.mdx": {
	id: "webhooks.mdx";
  slug: "api/webhooks";
  body: string;
  collection: "api";
  data: InferEntrySchema<"api">
} & { render(): Render[".mdx"] };
"workspace-memberships.mdx": {
	id: "workspace-memberships.mdx";
  slug: "api/workspace-memberships";
  body: string;
  collection: "api";
  data: InferEntrySchema<"api">
} & { render(): Render[".mdx"] };
"workspace-settings.mdx": {
	id: "workspace-settings.mdx";
  slug: "api/workspace-settings";
  body: string;
  collection: "api";
  data: InferEntrySchema<"api">
} & { render(): Render[".mdx"] };
"workspace.mdx": {
	id: "workspace.mdx";
  slug: "api/workspace";
  body: string;
  collection: "api";
  data: InferEntrySchema<"api">
} & { render(): Render[".mdx"] };
};
"docs": {
"getting-started/concepts.mdx": {
	id: "getting-started/concepts.mdx";
  slug: "getting-started/concepts";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"getting-started/introduction.mdx": {
	id: "getting-started/introduction.mdx";
  slug: "getting-started/introduction";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"javascript-sdk/javascript-sdk.md": {
	id: "javascript-sdk/javascript-sdk.md";
  slug: "javascript-sdk/introduction";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"self-hosting/configuration.mdx": {
	id: "self-hosting/configuration.mdx";
  slug: "self-hosting/configuration";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"self-hosting/docker.mdx": {
	id: "self-hosting/docker.mdx";
  slug: "self-hosting/docker";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"usage-guide/configuring-vrite.md": {
	id: "usage-guide/configuring-vrite.md";
  slug: "usage-guide/configuring-vrite";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"usage-guide/content-editor.md": {
	id: "usage-guide/content-editor.md";
  slug: "usage-guide/content-editor";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"usage-guide/extensions/introduction.mdx": {
	id: "usage-guide/extensions/introduction.mdx";
  slug: "usage-guide/extensions/introduction";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"usage-guide/extensions/official-extensions/dev.mdx": {
	id: "usage-guide/extensions/official-extensions/dev.mdx";
  slug: "usage-guide/extensions/official/dev";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"usage-guide/extensions/official-extensions/gpt.mdx": {
	id: "usage-guide/extensions/official-extensions/gpt.mdx";
  slug: "usage-guide/extensions/official/gpt";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"usage-guide/extensions/official-extensions/hashnode.mdx": {
	id: "usage-guide/extensions/official-extensions/hashnode.mdx";
  slug: "usage-guide/extensions/official/hashnode";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"usage-guide/extensions/official-extensions/mdx.mdx": {
	id: "usage-guide/extensions/official-extensions/mdx.mdx";
  slug: "usage-guide/extensions/official/mdx";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"usage-guide/extensions/official-extensions/medium.mdx": {
	id: "usage-guide/extensions/official-extensions/medium.mdx";
  slug: "usage-guide/extensions/official/medium";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"usage-guide/metadata.md": {
	id: "usage-guide/metadata.md";
  slug: "usage-guide/metadata";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"usage-guide/navigation/command-palette.md": {
	id: "usage-guide/navigation/command-palette.md";
  slug: "usage-guide/navigation/command-palette";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"usage-guide/navigation/dashboard.md": {
	id: "usage-guide/navigation/dashboard.md";
  slug: "usage-guide/navigation/dashboard";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"usage-guide/navigation/explorer.md": {
	id: "usage-guide/navigation/explorer.md";
  slug: "usage-guide/navigation/explorer";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".md"] };
"usage-guide/navigation/navigation.mdx": {
	id: "usage-guide/navigation/navigation.mdx";
  slug: "usage-guide/navigation/introduction";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
};
"recipes": Record<string, {
  id: string;
  slug: string;
  body: string;
  collection: "recipes";
  data: InferEntrySchema<"recipes">;
  render(): Render[".md"];
}>;

	};

	type DataEntryMap = {
		
	};

	type AnyEntryMap = ContentEntryMap & DataEntryMap;

	export type ContentConfig = typeof import("../src/content/config.js");
}
