import type { JsonSchema } from "@sudobility/shapeshyft_types";

type MediaType = "image" | "audio" | "video";

interface JsonSchemaProperty {
  type?: string;
  format?: string;
  contentMediaType?: string;
  properties?: Record<string, JsonSchemaProperty>;
  items?: JsonSchemaProperty;
}

/**
 * Detect if a schema property is a media type
 */
function detectMediaType(property: JsonSchemaProperty): MediaType | null {
  if (
    property.type === "string" &&
    property.format === "binary" &&
    property.contentMediaType
  ) {
    if (property.contentMediaType.startsWith("image/")) return "image";
    if (property.contentMediaType.startsWith("audio/")) return "audio";
    if (property.contentMediaType.startsWith("video/")) return "video";
  }
  return null;
}

/**
 * Extract media fields from a JSON schema
 * Returns a record of field name -> media type
 */
export function extractMediaFields(
  schema: JsonSchema | null,
): Record<string, MediaType> {
  if (!schema || schema.type !== "object" || !schema.properties) {
    return {};
  }

  const mediaFields: Record<string, MediaType> = {};

  for (const [name, property] of Object.entries(schema.properties)) {
    const prop = property as JsonSchemaProperty;
    const mediaType = detectMediaType(prop);
    if (mediaType) {
      mediaFields[name] = mediaType;
    }
  }

  return mediaFields;
}

/**
 * Check if a schema has any media fields
 */
export function hasMediaFields(schema: JsonSchema | null): boolean {
  return Object.keys(extractMediaFields(schema)).length > 0;
}

/**
 * Extract media values from output data based on schema
 * Returns array of { fieldName, type, data } objects
 */
export function extractMediaFromOutput(
  schema: JsonSchema | null,
  data: unknown,
): Array<{ fieldName: string; type: MediaType; data: string }> {
  const mediaFields = extractMediaFields(schema);
  const results: Array<{ fieldName: string; type: MediaType; data: string }> =
    [];

  if (!data || typeof data !== "object") {
    return results;
  }

  const dataObj = data as Record<string, unknown>;

  for (const [fieldName, mediaType] of Object.entries(mediaFields)) {
    const value = dataObj[fieldName];
    if (typeof value === "string" && value.length > 0) {
      results.push({
        fieldName,
        type: mediaType,
        data: value,
      });
    }
  }

  return results;
}

/**
 * Get non-media fields from a schema (for the JSON editor)
 */
export function getNonMediaFields(schema: JsonSchema | null): string[] {
  if (!schema || schema.type !== "object" || !schema.properties) {
    return [];
  }

  const mediaFields = extractMediaFields(schema);
  return Object.keys(schema.properties).filter(
    (name) => !(name in mediaFields),
  );
}

/**
 * Merge media data into input object
 */
export function mergeMediaIntoInput(
  baseInput: Record<string, unknown>,
  mediaFiles: Record<string, string>,
): Record<string, unknown> {
  return {
    ...baseInput,
    ...mediaFiles,
  };
}
