import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const portfolioDirectory = path.join(process.cwd(), 'content/portofolio');

export interface PortfolioCaseStudyData {
  slug: string;
  title: string;
  category: string;
  client: string;
  service: string;
  date: string;
  coverImage: string;
  liveUrl: string;
  summary: string;
}

export interface PortfolioCaseStudy extends PortfolioCaseStudyData {
  contentHtml: string;
}

export function getSortedPortfoliosData(): PortfolioCaseStudyData[] {
  if (!fs.existsSync(portfolioDirectory)) {
    return [];
  }
  const fileNames = fs.readdirSync(portfolioDirectory);
  const allData = fileNames.map(fileName => {
    const slug = fileName.replace(/\.md$/, '');
    const fullPath = path.join(portfolioDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const matterResult = matter(fileContents);
    return {
      slug,
      ...(matterResult.data as Omit<PortfolioCaseStudyData, 'slug'>),
    };
  });

  return allData.sort((a, b) => {
    if (a.date < b.date) return 1;
    else return -1;
  });
}

export function getAllPortfolioSlugs() {
  if (!fs.existsSync(portfolioDirectory)) {
    return [];
  }
  const fileNames = fs.readdirSync(portfolioDirectory);
  return fileNames.map(fileName => {
    return {
      params: {
        slug: fileName.replace(/\.md$/, '')
      }
    };
  });
}

export async function getPortfolioData(slug: string): Promise<PortfolioCaseStudy | null> {
  const fullPath = path.join(portfolioDirectory, `${slug}.md`);
  
  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents);

  // Use remark to convert markdown into HTML string
  const processedContent = await remark()
    .use(html)
    .process(matterResult.content);
  const contentHtml = processedContent.toString();

  // Combine the data with the id and contentHtml
  return {
    slug,
    contentHtml,
    ...(matterResult.data as { 
        title: string; 
        category: string; 
        client: string;
        service: string;
        date: string; 
        coverImage: string;
        liveUrl: string;
        summary: string;
    }),
  };
}
