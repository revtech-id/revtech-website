import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const portfolioDirectory = path.join(process.cwd(), 'content/portofolio');

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      client,
      category,
      url,
      projectDate,
      description,
      content,
      thumbnail,
      featured,
      slug: existingSlug,
    } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const slug = existingSlug || generateSlug(title);

    // Ensure directory exists
    if (!fs.existsSync(portfolioDirectory)) {
      fs.mkdirSync(portfolioDirectory, { recursive: true });
    }

    const frontmatter = [
      '---',
      `title: ${JSON.stringify(title)}`,
      `category: ${JSON.stringify(category || '')}`,
      `client: ${JSON.stringify(client || '')}`,
      `service: ${JSON.stringify(category || '')}`,
      `date: ${JSON.stringify(projectDate || new Date().toISOString().split('T')[0])}`,
      `coverImage: ${JSON.stringify(thumbnail || '')}`,
      `liveUrl: ${JSON.stringify(url || '')}`,
      `summary: ${JSON.stringify(description || '')}`,
      `featured: ${featured ? 'true' : 'false'}`,
      '---',
    ].join('\n');

    const fileContent = `${frontmatter}\n\n${content || ''}`;
    const filePath = path.join(portfolioDirectory, `${slug}.md`);
    fs.writeFileSync(filePath, fileContent, 'utf8');

    return NextResponse.json({ success: true, slug });
  } catch (error) {
    console.error('Error saving portfolio:', error);
    return NextResponse.json({ error: 'Failed to save portfolio' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    const filePath = path.join(portfolioDirectory, `${slug}.md`);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting portfolio:', error);
    return NextResponse.json({ error: 'Failed to delete portfolio' }, { status: 500 });
  }
}
