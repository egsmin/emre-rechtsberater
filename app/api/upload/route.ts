import { addVectorsToCollection, chunkText, embedText, fileToText } from '@/lib/rag';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const regex = formData.get('regex') as string | undefined;
    const chunkSize = formData.get('chunkSize') as string | undefined;
    const title = formData.get('title') as string;
    if (!file) {
      return NextResponse.json(
        { error: 'Keine Datei bereitgestellt' },
        { status: 400 }
      );
    }

    const text = await fileToText(file);

    const chunks = chunkText(text, Number(chunkSize), regex, title);

    const vectors = [];

    for (const chunk of chunks) {
      const vector = await embedText(chunk);
      vectors.push({
        text: chunk,
        vector: vector,
      });
    }

    await addVectorsToCollection(vectors, title);
    return NextResponse.json({
      success: true,
      text: text,
    });
  } catch (error) {
    console.error('Upload-Fehler:', error);
    return NextResponse.json(
      { error: 'Fehler beim Verarbeiten des Uploads' },
      { status: 500 }
    );
  }
}

