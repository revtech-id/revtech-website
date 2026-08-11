import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const blogDirectory = path.join(process.cwd(), 'content/blog');

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
      content,
      coverImage,
      description,
      category,
      publishedAt,
      slug: existingSlug,
    } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const slug = existingSlug || generateSlug(title);
    const dateStr = publishedAt
      ? new Date(publishedAt).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];

    // Ensure directory exists
    if (!fs.existsSync(blogDirectory)) {
      fs.mkdirSync(blogDirectory, { recursive: true });
    }

    const frontmatter = [
      '---',
      `title: ${JSON.stringify(title)}`,
      `date: ${JSON.stringify(dateStr)}`,
      `description: ${JSON.stringify(description || '')}`,
      `coverImage: ${JSON.stringify(coverImage || '')}`,
      `category: ${JSON.stringify(category || '')}`,
      '---',
    ].join('\n');

    const fileContent = `${frontmatter}\n\n${content || ''}`;
    const filePath = path.join(blogDirectory, `${slug}.md`);
    fs.writeFileSync(filePath, fileContent, 'utf8');

    return NextResponse.json({ success: true, slug });
  } catch (error) {
    console.error('Error saving blog post:', error);
    return NextResponse.json({ error: 'Failed to save blog post' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    const filePath = path.join(blogDirectory, `${slug}.md`);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json({ error: 'Failed to delete blog post' }, { status: 500 });
  }
}
