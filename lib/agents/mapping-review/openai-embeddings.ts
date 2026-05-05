export const DEFAULT_EMBEDDING_MODEL = "text-embedding-3-small";
export const EMBEDDING_DIMENSIONS = 1536;

type OpenAIEmbeddingItem = {
  embedding: unknown;
  index: unknown;
};

type OpenAIEmbeddingResponse = {
  data?: OpenAIEmbeddingItem[];
};

export async function createEmbeddings(input: {
  apiKey: string;
  inputs: string[];
  model?: string;
}) {
  const model = input.model ?? DEFAULT_EMBEDDING_MODEL;
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    body: JSON.stringify({
      encoding_format: "float",
      input: input.inputs,
      model,
    }),
    headers: {
      Authorization: `Bearer ${input.apiKey}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI embeddings request failed: ${response.status} ${body}`);
  }

  const payload = (await response.json()) as OpenAIEmbeddingResponse;

  if (!Array.isArray(payload.data)) {
    throw new Error("OpenAI embeddings response did not include a data array.");
  }

  return payload.data
    .slice()
    .sort((a, b) => readIndex(a) - readIndex(b))
    .map((item) => readEmbedding(item));
}

export function cosineSimilarity(a: number[], b: number[]) {
  if (a.length !== b.length) {
    throw new Error(`Cannot compare vectors with different dimensions: ${a.length} vs ${b.length}.`);
  }

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let index = 0; index < a.length; index += 1) {
    const aValue = a[index] ?? 0;
    const bValue = b[index] ?? 0;
    dot += aValue * bValue;
    normA += aValue * aValue;
    normB += bValue * bValue;
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function formatPgVector(vector: number[]) {
  if (vector.length !== EMBEDDING_DIMENSIONS) {
    throw new Error(
      `Expected ${EMBEDDING_DIMENSIONS} embedding dimensions, received ${vector.length}.`,
    );
  }

  return `[${vector.join(",")}]`;
}

function readIndex(item: OpenAIEmbeddingItem) {
  if (typeof item.index !== "number") {
    throw new Error("OpenAI embedding item is missing a numeric index.");
  }

  return item.index;
}

function readEmbedding(item: OpenAIEmbeddingItem) {
  if (!Array.isArray(item.embedding)) {
    throw new Error("OpenAI embedding item is missing an embedding array.");
  }

  if (item.embedding.length !== EMBEDDING_DIMENSIONS) {
    throw new Error(
      `Expected ${EMBEDDING_DIMENSIONS} embedding dimensions, received ${item.embedding.length}.`,
    );
  }

  return item.embedding.map((value) => {
    if (typeof value !== "number") {
      throw new Error("OpenAI embedding vector contains a non-numeric value.");
    }

    return value;
  });
}
