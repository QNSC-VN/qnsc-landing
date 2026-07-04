import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

const services = defineCollection({
  loader: file('src/content/services/services.json'),
  schema: z.object({
    id: z.string(),
    icon: z.string(), // inline svg path data, rendered via Icon component
    title: z.string(),
    description: z.string(),
    tags: z.array(z.string()),
  }),
});

const products = defineCollection({
  loader: file('src/content/products/products.json'),
  schema: z.object({
    id: z.string(),
    tag: z.string(),
    tagColor: z.enum(['default', 'teal', 'gold']),
    featured: z.boolean().default(false),
    title: z.string(),
    description: z.string(),
    specs: z.array(z.object({ key: z.string(), value: z.string() })),
    market: z.string(),
  }),
});

const leadership = defineCollection({
  loader: file('src/content/leadership/leadership.json'),
  schema: z.object({
    id: z.string(),
    group: z.enum(['leadership', 'advisor-lead', 'advisor']),
    name: z.string(),
    nameEn: z.string().optional(),
    role: z.string(),
    photo: z.string().optional(),
    initials: z.string().optional(),
    bio: z.string().optional(),
    bioMission: z.string().optional(),
    highlights: z.array(z.string()).optional(),
    stats: z
      .array(z.object({ num: z.string(), unit: z.string().optional(), label: z.string() }))
      .optional(),
    credLine: z.string().optional(),
  }),
});

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: 'src/content/articles' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    author: z.string(),
    authorRole: z.string(),
    publishedAt: z.date(),
    heroImage: z.string(),
  }),
});

export const collections = { services, products, leadership, articles };
