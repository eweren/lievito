// Recipe-Loader. Liest alle `*.md` aus `src/lib/recipes/` zur Build-Zeit
// via Vite glob. Frontmatter-Felder werden via mdsvex an `metadata`
// exportiert, der Body als Svelte-Komponente.

import type { Component } from 'svelte';
import type { DoughStyle } from '$lib/types/schema';

export interface RecipeMetadata {
  title: string;
  slug: string;
  style: DoughStyle;
  difficulty: 'einsteiger' | 'fortgeschritten' | 'profi';
  maturationHours: number;
  ballWeight?: number;
  hydration?: number;
  preFerment?: 'none' | 'poolish' | 'biga' | 'lievito-madre';
  excerpt: string;
  tags?: string[];
  publishedAt: string;
}

export interface RecipeModule {
  metadata: RecipeMetadata;
  default: Component;
}

export interface Recipe extends RecipeMetadata {
  component: Component;
}

const modules = import.meta.glob<RecipeModule>('./*.md', { eager: true });

const list = Object.entries(modules).map(([path, mod]) => {
  const fileSlug = path.replace(/^\.\//, '').replace(/\.md$/, '');
  const metadata: RecipeMetadata = {
    ...mod.metadata,
    slug: mod.metadata.slug ?? fileSlug
  };
  return {
    ...metadata,
    component: mod.default
  } satisfies Recipe;
});

export const RECIPES = list.sort(
  (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt)
);

export function getRecipe(slug: string): Recipe | undefined {
  return RECIPES.find((r) => r.slug === slug);
}

export const RECIPE_SLUGS = RECIPES.map((r) => r.slug);
