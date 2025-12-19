import { QdrantClient } from "@qdrant/js-client-rest";
import crypto from "crypto";
import { openai } from "@ai-sdk/openai";
import { embed } from "ai";
import pdf from "pdf-parse";

const embeddingModel = openai.embedding("text-embedding-ada-002");

const client = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
  port: null,
});

const QDRANT_GLOBAL_COLLECTION_NAME =
  process.env.QDRANT_GLOBAL_COLLECTION_NAME || "global";

export async function getGlobalCollection() {
  try {
    await client.getCollection(QDRANT_GLOBAL_COLLECTION_NAME);
  } catch (error) {
    await client.createCollection(QDRANT_GLOBAL_COLLECTION_NAME, {
      vectors: {
        size: 1536,
        distance: "Cosine",
      },
    });
  }
  return QDRANT_GLOBAL_COLLECTION_NAME;
}

export async function addVectorsToCollection(
  chunks: { text: string; vector: number[] }[],
  marker?: string
) {
  const points = chunks.map((chunk, index) => ({
    id: crypto.randomUUID(),
    vector: chunk.vector,
    payload: {
      text: chunk.text,
      marker: marker || "",
    },
  }));

  await client.upsert(QDRANT_GLOBAL_COLLECTION_NAME, {
    points: points,
  });
}

export async function searchVectors({
  query,
  limit = 3,
  collectionName = QDRANT_GLOBAL_COLLECTION_NAME,
  marker,
}: {
  query: string;
  limit?: number;
  collectionName?: string;
  marker?: string;
}) {
  const embeddingResult = await embed({
    model: embeddingModel,
    value: query,
  });
  const queryVector = embeddingResult.embedding;

  let filter = undefined;
  if (marker) {
    filter = {
      must: [
        {
          key: "marker",
          match: {
            value: marker,
          },
        },
      ],
    };
  }

  const searchResult = await client.search(collectionName, {
    vector: queryVector,
    limit: limit,
    with_payload: true,
    filter: filter,
  });

  return searchResult;
}

export async function deleteVectorsFromCollection(
  documentId: string,
  collectionName: string = QDRANT_GLOBAL_COLLECTION_NAME
) {
  try {
    await client.delete(collectionName, {
      filter: {
        must: [
          {
            key: "documentId",
            match: {
              value: documentId,
            },
          },
        ],
      },
    });
  } catch (error) {
    throw error;
  }
}

export async function deleteCollection(collectionName: string) {
  try {
    await client.deleteCollection(collectionName);
  } catch (error) {
    throw error;
  }
}

export async function fileToText(file: File): Promise<string> {
  const dataBuffer = await file.arrayBuffer();
  const data = await pdf(Buffer.from(dataBuffer));
  return data.text;
}

function splitKeepSeparatorAtStart(text: string, regex: RegExp) {
  const result = [];
  let lastIndex = 0;

  const globalRegex = new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : regex.flags + 'g');

  for (const match of text.matchAll(globalRegex)) {
    const matchStart = match.index;
    if (matchStart > lastIndex) {
      result.push(text.slice(lastIndex, matchStart)); // Teil vor Match
    }
    lastIndex = matchStart;
  }

  // Letzter Teil
  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }

  return result;
}

export function chunkText(
  text: string,
  chunkSize: number,
  regex?: string,
  prefix?: string
): string[] {
  let chunks: string[] = [];

  if (regex && regex.length > 0) {
    let flags = "gmi";

    let regexp = new RegExp(regex, flags);
    let matches = splitKeepSeparatorAtStart(text, regexp);

    chunks = text.split(new RegExp(regex, flags));
    chunks = matches;
    if (prefix && prefix.length > 0) {
      chunks = chunks.map((chunk) => prefix + " " + chunk);
    }
  } else {
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.slice(i, i + chunkSize));
    }

    for (let i = 0; i < chunks.length; i++) {
      if (chunks[i].length >= 10000) {
        chunks[i] = chunks[i].slice(0, 10000);
        chunks.splice(i + 1, 0, chunks[i].slice(10000));
      }
      if (chunks[i].length == 0) {
        chunks.splice(i, 1);
      }
    }
  }
  return chunks;
}

export async function embedText(text: string) {
  const embedding = await embed({
    model: embeddingModel,
    value: text,
  });
  return embedding.embedding;
}