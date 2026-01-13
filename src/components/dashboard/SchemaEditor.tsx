import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";

type JsonSchemaType =
  | "string"
  | "number"
  | "integer"
  | "boolean"
  | "object"
  | "array";

// Extended type for display purposes (includes media pseudo-types)
type PropertyDisplayType = JsonSchemaType | "image" | "audio" | "video";

interface JsonSchemaProperty {
  type: JsonSchemaType;
  description?: string;
  items?: JsonSchemaProperty;
  properties?: Record<string, JsonSchemaProperty>;
  required?: string[];
  // Media type support
  format?: string;
  contentMediaType?: string;
}

// Helper to detect if a property is a media type
function getDisplayType(property: JsonSchemaProperty): PropertyDisplayType {
  if (
    property.type === "string" &&
    property.format === "binary" &&
    property.contentMediaType
  ) {
    if (property.contentMediaType.startsWith("image/")) return "image";
    if (property.contentMediaType.startsWith("audio/")) return "audio";
    if (property.contentMediaType.startsWith("video/")) return "video";
  }
  return property.type;
}

// Helper to create a media property schema
function createMediaProperty(
  mediaType: "image" | "audio" | "video",
  description?: string,
): JsonSchemaProperty {
  const mediaTypes: Record<string, string> = {
    image: "image/*",
    audio: "audio/*",
    video: "video/*",
  };
  return {
    type: "string",
    format: "binary",
    contentMediaType: mediaTypes[mediaType],
    description,
  };
}

interface JsonSchema {
  type: "object";
  properties: Record<string, JsonSchemaProperty>;
  required: string[];
}

interface PropertyEditorProps {
  name: string;
  property: JsonSchemaProperty;
  isRequired: boolean;
  onUpdate: (name: string, property: JsonSchemaProperty) => void;
  onRemove: (name: string) => void;
  onRename: (oldName: string, newName: string) => void;
  onToggleRequired: (name: string) => void;
  depth?: number;
}

function PropertyEditor({
  name,
  property,
  isRequired,
  onUpdate,
  onRemove,
  onRename,
  onToggleRequired,
  depth = 0,
}: PropertyEditorProps) {
  const { t } = useTranslation("dashboard");
  const [isExpanded, setIsExpanded] = useState(depth < 2);
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(name);

  const handleTypeChange = (newType: PropertyDisplayType) => {
    // Handle media types
    if (newType === "image" || newType === "audio" || newType === "video") {
      onUpdate(name, createMediaProperty(newType, property.description));
      return;
    }

    const updated: JsonSchemaProperty = {
      type: newType,
      description: property.description,
    };
    if (newType === "object") {
      updated.properties = {};
      updated.required = [];
    } else if (newType === "array") {
      updated.items = { type: "string" };
    }
    onUpdate(name, updated);
  };

  // Get the display type for the current property
  const displayType = getDisplayType(property);

  const handleDescriptionChange = (description: string) => {
    onUpdate(name, { ...property, description: description || undefined });
  };

  const handleNameBlur = () => {
    setEditingName(false);
    if (tempName && tempName !== name) {
      onRename(name, tempName);
    } else {
      setTempName(name);
    }
  };

  const handleAddNestedProperty = () => {
    if (property.type !== "object") return;
    const newProps = { ...property.properties };
    let newName = "newProperty";
    let counter = 1;
    while (newProps[newName]) {
      newName = `newProperty${counter++}`;
    }
    newProps[newName] = { type: "string" };
    onUpdate(name, { ...property, properties: newProps });
  };

  const handleUpdateNestedProperty = (
    propName: string,
    propValue: JsonSchemaProperty,
  ) => {
    if (property.type !== "object") return;
    onUpdate(name, {
      ...property,
      properties: { ...property.properties, [propName]: propValue },
    });
  };

  const handleRemoveNestedProperty = (propName: string) => {
    if (property.type !== "object") return;
    const newProps = { ...property.properties };
    delete newProps[propName];
    const newRequired = (property.required || []).filter((r) => r !== propName);
    onUpdate(name, {
      ...property,
      properties: newProps,
      required: newRequired,
    });
  };

  const handleRenameNestedProperty = (oldName: string, newName: string) => {
    if (property.type !== "object" || !property.properties) return;
    const newProps: Record<string, JsonSchemaProperty> = {};
    for (const [key, value] of Object.entries(property.properties)) {
      newProps[key === oldName ? newName : key] = value;
    }
    const newRequired = (property.required || []).map((r) =>
      r === oldName ? newName : r,
    );
    onUpdate(name, {
      ...property,
      properties: newProps,
      required: newRequired,
    });
  };

  const handleToggleNestedRequired = (propName: string) => {
    if (property.type !== "object") return;
    const currentRequired = property.required || [];
    const newRequired = currentRequired.includes(propName)
      ? currentRequired.filter((r) => r !== propName)
      : [...currentRequired, propName];
    onUpdate(name, { ...property, required: newRequired });
  };

  const handleArrayItemTypeChange = (itemType: JsonSchemaType) => {
    if (property.type !== "array") return;
    const items: JsonSchemaProperty = { type: itemType };
    if (itemType === "object") {
      items.properties = {};
      items.required = [];
    }
    onUpdate(name, { ...property, items });
  };

  const indentClass =
    depth > 0 ? "ml-4 pl-4 border-l-2 border-theme-border" : "";

  return (
    <div className={`${indentClass} py-2`}>
      <div className="flex items-center gap-2 flex-wrap">
        {/* Expand/Collapse for complex types */}
        {(property.type === "object" || property.type === "array") && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-theme-hover-bg rounded"
          >
            <svg
              className={`w-4 h-4 text-theme-text-secondary transition-transform ${isExpanded ? "rotate-90" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        )}

        {/* Property Name */}
        {editingName ? (
          <input
            type="text"
            value={tempName}
            onChange={(e) =>
              setTempName(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))
            }
            onBlur={handleNameBlur}
            onKeyDown={(e) => e.key === "Enter" && handleNameBlur()}
            autoFocus
            className="px-2 py-1 w-32 border border-blue-500 rounded bg-theme-bg-primary text-sm font-mono ring-2 ring-blue-500/20"
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditingName(true)}
            className="group/name px-2 py-1 text-sm font-mono text-theme-text-primary border border-dashed border-theme-border hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded flex items-center gap-1.5 transition-colors"
            title={t("schema.clickToEditName")}
          >
            {name}
            <svg
              className="w-3 h-3 text-theme-text-tertiary group-hover/name:text-blue-500 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </button>
        )}

        {/* Type Selector */}
        <select
          value={displayType}
          onChange={(e) => handleTypeChange(e.target.value as PropertyDisplayType)}
          className="px-2 py-1 text-sm border border-theme-border rounded bg-theme-bg-primary"
        >
          <optgroup label={t("schema.basicTypes")}>
            <option value="string">string</option>
            <option value="number">number</option>
            <option value="integer">integer</option>
            <option value="boolean">boolean</option>
            <option value="object">object</option>
            <option value="array">array</option>
          </optgroup>
          <optgroup label={t("schema.mediaTypes")}>
            <option value="image">image</option>
            <option value="audio">audio</option>
            <option value="video">video</option>
          </optgroup>
        </select>

        {/* Array Item Type */}
        {property.type === "array" && (
          <>
            <span className="text-theme-text-tertiary text-sm">of</span>
            <select
              value={property.items?.type || "string"}
              onChange={(e) =>
                handleArrayItemTypeChange(e.target.value as JsonSchemaType)
              }
              className="px-2 py-1 text-sm border border-theme-border rounded bg-theme-bg-primary"
            >
              <option value="string">string</option>
              <option value="number">number</option>
              <option value="integer">integer</option>
              <option value="boolean">boolean</option>
              <option value="object">object</option>
            </select>
          </>
        )}

        {/* Required Toggle */}
        <label className="flex items-center gap-1 text-sm text-theme-text-secondary">
          <input
            type="checkbox"
            checked={isRequired}
            onChange={() => onToggleRequired(name)}
            className="rounded"
          />
          {t("schema.required")}
        </label>

        {/* Remove Button */}
        <button
          type="button"
          onClick={() => onRemove(name)}
          className="p-1 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
          title={t("common.remove")}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Description */}
      <div className="mt-1 ml-6">
        <input
          type="text"
          value={property.description || ""}
          onChange={(e) => handleDescriptionChange(e.target.value)}
          placeholder={t("schema.descriptionPlaceholder")}
          className="w-full px-2 py-1 text-sm border border-theme-border rounded bg-theme-bg-primary text-theme-text-secondary"
        />
      </div>

      {/* Nested Object Properties */}
      {property.type === "object" && isExpanded && (
        <div className="mt-2">
          {Object.entries(property.properties || {}).map(
            ([propName, propValue]) => (
              <PropertyEditor
                key={propName}
                name={propName}
                property={propValue}
                isRequired={(property.required || []).includes(propName)}
                onUpdate={handleUpdateNestedProperty}
                onRemove={handleRemoveNestedProperty}
                onRename={handleRenameNestedProperty}
                onToggleRequired={handleToggleNestedRequired}
                depth={depth + 1}
              />
            ),
          )}
          <button
            type="button"
            onClick={handleAddNestedProperty}
            className="mt-2 ml-4 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded flex items-center gap-1"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            {t("schema.addProperty")}
          </button>
        </div>
      )}

      {/* Array Items (if object type) */}
      {property.type === "array" &&
        property.items?.type === "object" &&
        isExpanded && (
          <div className="mt-2 ml-4">
            <p className="text-xs text-theme-text-tertiary mb-2">
              {t("schema.arrayItemSchema")}
            </p>
            <SchemaEditorInner
              schema={{
                type: "object",
                properties: property.items.properties || {},
                required: property.items.required || [],
              }}
              onChange={(itemSchema) => {
                onUpdate(name, {
                  ...property,
                  items: {
                    type: "object",
                    properties: itemSchema.properties,
                    required: itemSchema.required,
                  },
                });
              }}
              depth={depth + 1}
            />
          </div>
        )}
    </div>
  );
}

interface SchemaEditorInnerProps {
  schema: JsonSchema;
  onChange: (schema: JsonSchema) => void;
  depth?: number;
}

function SchemaEditorInner({
  schema,
  onChange,
  depth = 0,
}: SchemaEditorInnerProps) {
  const { t } = useTranslation("dashboard");

  const handleAddProperty = () => {
    const newProps = { ...schema.properties };
    let newName = "newProperty";
    let counter = 1;
    while (newProps[newName]) {
      newName = `newProperty${counter++}`;
    }
    newProps[newName] = { type: "string" };
    onChange({ ...schema, properties: newProps });
  };

  const handleUpdateProperty = (name: string, property: JsonSchemaProperty) => {
    onChange({
      ...schema,
      properties: { ...schema.properties, [name]: property },
    });
  };

  const handleRemoveProperty = (name: string) => {
    const newProps = { ...schema.properties };
    delete newProps[name];
    onChange({
      ...schema,
      properties: newProps,
      required: schema.required.filter((r) => r !== name),
    });
  };

  const handleRenameProperty = (oldName: string, newName: string) => {
    const newProps: Record<string, JsonSchemaProperty> = {};
    for (const [key, value] of Object.entries(schema.properties)) {
      newProps[key === oldName ? newName : key] = value;
    }
    onChange({
      ...schema,
      properties: newProps,
      required: schema.required.map((r) => (r === oldName ? newName : r)),
    });
  };

  const handleToggleRequired = (name: string) => {
    const newRequired = schema.required.includes(name)
      ? schema.required.filter((r) => r !== name)
      : [...schema.required, name];
    onChange({ ...schema, required: newRequired });
  };

  return (
    <div>
      {Object.entries(schema.properties).map(([name, property]) => (
        <PropertyEditor
          key={name}
          name={name}
          property={property}
          isRequired={schema.required.includes(name)}
          onUpdate={handleUpdateProperty}
          onRemove={handleRemoveProperty}
          onRename={handleRenameProperty}
          onToggleRequired={handleToggleRequired}
          depth={depth}
        />
      ))}
      {Object.keys(schema.properties).length === 0 && (
        <p className="text-sm text-theme-text-tertiary italic py-2">
          {t("schema.noProperties")}
        </p>
      )}
      <button
        type="button"
        onClick={handleAddProperty}
        className="mt-2 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded flex items-center gap-1"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
        {t("schema.addProperty")}
      </button>
    </div>
  );
}

interface SchemaEditorProps {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
}

function SchemaEditor({ value, onChange, error }: SchemaEditorProps) {
  const { t } = useTranslation("dashboard");
  const [isRawMode, setIsRawMode] = useState(false);

  const parseSchema = useCallback((): JsonSchema | null => {
    try {
      const parsed = JSON.parse(value);
      if (parsed.type === "object" && typeof parsed.properties === "object") {
        return {
          type: "object",
          properties: parsed.properties || {},
          required: Array.isArray(parsed.required) ? parsed.required : [],
        };
      }
      return null;
    } catch {
      return null;
    }
  }, [value]);

  const schema = parseSchema();
  const canUseVisualMode = schema !== null;

  const handleSchemaChange = (newSchema: JsonSchema) => {
    onChange(JSON.stringify(newSchema, null, 2));
  };

  return (
    <div
      className={`border rounded-lg ${error ? "border-red-500" : "border-theme-border"}`}
    >
      {/* Mode Toggle */}
      <div className="flex items-center justify-between px-3 py-2 bg-theme-bg-secondary border-b border-theme-border rounded-t-lg">
        <span className="text-sm font-medium text-theme-text-primary">
          {t("schema.editor")}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsRawMode(false)}
            disabled={!canUseVisualMode}
            className={`px-2 py-1 text-xs rounded ${
              !isRawMode && canUseVisualMode
                ? "bg-blue-600 text-white"
                : "bg-theme-bg-tertiary text-theme-text-secondary hover:bg-theme-hover-bg disabled:opacity-50"
            }`}
          >
            {t("schema.visual")}
          </button>
          <button
            type="button"
            onClick={() => setIsRawMode(true)}
            className={`px-2 py-1 text-xs rounded ${
              isRawMode
                ? "bg-blue-600 text-white"
                : "bg-theme-bg-tertiary text-theme-text-secondary hover:bg-theme-hover-bg"
            }`}
          >
            {t("schema.json")}
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="p-3">
        {isRawMode || !canUseVisualMode ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={8}
            className="w-full px-3 py-2 bg-theme-bg-primary border border-theme-border rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
          />
        ) : (
          <SchemaEditorInner schema={schema!} onChange={handleSchemaChange} />
        )}
      </div>
    </div>
  );
}

export default SchemaEditor;
