import { error } from '@sveltejs/kit';
import { getRecipe, RECIPE_SLUGS } from '$lib/recipes';
import type { PageLoad } from './$types';

export const prerender = true;

export function entries() {
  return RECIPE_SLUGS.map((slug) => ({ slug }));
}

export const load: PageLoad = ({ params }) => {
  const recipe = getRecipe(params.slug);
  if (!recipe) throw error(404, 'Rezept nicht gefunden');
  return { recipe };
};
