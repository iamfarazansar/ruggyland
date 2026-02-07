import {
  Container,
  Heading,
  Button,
  Input,
  Textarea,
  Label,
  Switch,
} from "@medusajs/ui";
import { useEffect, useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { sdk } from "../../../lib/sdk";

type StoryStep = {
  title: string;
  description: string;
  image_url: string;
};

type FormData = {
  title: string;
  slug: string;
  subtitle: string;
  thumbnail: string;
  size: string;
  material: string;
  intro_text: string;
  steps: StoryStep[];
  published: boolean;
};

type RugStory = FormData & { id: string };

// Helper to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
  });
};

// Get the ID from the URL
const getIdFromUrl = () => {
  const pathParts = window.location.pathname.split("/");
  return pathParts[pathParts.length - 1];
};

export default function EditRugStoryPage() {
  const id = getIdFromUrl();
  const queryClient = useQueryClient();
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormData>({
    title: "",
    slug: "",
    subtitle: "",
    thumbnail: "",
    size: "",
    material: "",
    intro_text: "",
    steps: [],
    published: false,
  });

  const [uploading, setUploading] = useState<{
    thumbnail: boolean;
    steps: { [key: number]: boolean };
  }>({
    thumbnail: false,
    steps: {},
  });

  const { data, isLoading } = useQuery<{ story: RugStory }>({
    queryKey: ["rug-story", id],
    queryFn: async () => {
      return (await sdk.client.fetch(`/admin/rug-stories/${id}`, {
        method: "GET",
      })) as { story: RugStory };
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (data?.story) {
      setForm({
        title: data.story.title || "",
        slug: data.story.slug || "",
        subtitle: data.story.subtitle || "",
        thumbnail: data.story.thumbnail || "",
        size: data.story.size || "",
        material: data.story.material || "",
        intro_text: data.story.intro_text || "",
        steps: data.story.steps || [],
        published: data.story.published || false,
      });
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return sdk.client.fetch(`/admin/rug-stories/${id}`, {
        method: "PUT",
        body: formData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rug-stories"] });
      queryClient.invalidateQueries({ queryKey: ["rug-story", id] });
      window.location.href = "/app/rug-stories";
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return sdk.client.fetch(`/admin/rug-stories/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rug-stories"] });
      window.location.href = "/app/rug-stories";
    },
  });

  const updateField = <K extends keyof FormData>(
    key: K,
    value: FormData[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const generateSlug = () => {
    const slug = form.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    updateField("slug", slug);
  };

  const uploadFile = async (
    file: File,
    imageType: "thumbnail" | "step",
    stepIndex?: number,
  ): Promise<string | null> => {
    try {
      const base64 = await fileToBase64(file);
      const currentSlug =
        form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

      const response = (await sdk.client.fetch("/admin/rug-stories/upload", {
        method: "POST",
        body: {
          file: base64,
          filename: file.name,
          mimeType: file.type,
          storySlug: currentSlug,
          imageType,
          stepIndex,
        },
      })) as { file: { url: string } };

      return response.file.url;
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload image");
      return null;
    }
  };

  const handleThumbnailUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!form.slug && !form.title) {
      alert("Please enter a title first");
      return;
    }

    setUploading((prev) => ({ ...prev, thumbnail: true }));
    const url = await uploadFile(file, "thumbnail");
    setUploading((prev) => ({ ...prev, thumbnail: false }));

    if (url) {
      updateField("thumbnail", url);
    }
  };

  const handleStepImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!form.slug && !form.title) {
      alert("Please enter a title first");
      return;
    }

    setUploading((prev) => ({
      ...prev,
      steps: { ...prev.steps, [index]: true },
    }));
    const url = await uploadFile(file, "step", index);
    setUploading((prev) => ({
      ...prev,
      steps: { ...prev.steps, [index]: false },
    }));

    if (url) {
      updateStep(index, "image_url", url);
    }
  };

  const addStep = () => {
    setForm((prev) => ({
      ...prev,
      steps: [...prev.steps, { title: "", description: "", image_url: "" }],
    }));
  };

  const removeStep = (index: number) => {
    setForm((prev) => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index),
    }));
  };

  const updateStep = (index: number, field: keyof StoryStep, value: string) => {
    setForm((prev) => ({
      ...prev,
      steps: prev.steps.map((step, i) =>
        i === index ? { ...step, [field]: value } : step,
      ),
    }));
  };

  const moveStep = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= form.steps.length) return;

    setForm((prev) => {
      const newSteps = [...prev.steps];
      [newSteps[index], newSteps[newIndex]] = [
        newSteps[newIndex],
        newSteps[index],
      ];
      return { ...prev, steps: newSteps };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(form);
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this story?")) {
      deleteMutation.mutate();
    }
  };

  const handleCancel = () => {
    window.location.href = "/app/rug-stories";
  };

  if (isLoading) {
    return (
      <Container>
        <div>Loading...</div>
      </Container>
    );
  }

  return (
    <Container>
      <Heading className="mb-6">Edit Rug Story</Heading>

      <form onSubmit={handleSubmit} style={{ maxWidth: 600 }}>
        <div style={{ marginBottom: 16 }}>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={form.title}
            onChange={(e) => updateField("title", e.target.value)}
            required
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <Label htmlFor="slug">Slug *</Label>
          <div style={{ display: "flex", gap: 8 }}>
            <Input
              id="slug"
              value={form.slug}
              onChange={(e) => updateField("slug", e.target.value)}
              required
            />
            <Button type="button" variant="secondary" onClick={generateSlug}>
              Generate
            </Button>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <Label htmlFor="subtitle">Subtitle</Label>
          <Input
            id="subtitle"
            value={form.subtitle}
            onChange={(e) => updateField("subtitle", e.target.value)}
            placeholder="e.g., Collector Gift"
          />
        </div>

        {/* Thumbnail Upload */}
        <div style={{ marginBottom: 16 }}>
          <Label>Thumbnail Image</Label>
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              marginTop: 4,
            }}
          >
            <input
              ref={thumbnailInputRef}
              type="file"
              accept="image/*"
              onChange={handleThumbnailUpload}
              style={{ display: "none" }}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => thumbnailInputRef.current?.click()}
              isLoading={uploading.thumbnail}
            >
              {form.thumbnail ? "Change Image" : "Upload Image"}
            </Button>
            {form.thumbnail && (
              <Button
                type="button"
                variant="danger"
                size="small"
                onClick={() => updateField("thumbnail", "")}
              >
                Remove
              </Button>
            )}
          </div>
          {form.thumbnail && (
            <img
              src={form.thumbnail}
              alt="Thumbnail preview"
              style={{
                marginTop: 8,
                height: 128,
                width: 128,
                borderRadius: 8,
                objectFit: "cover",
                border: "1px solid #eee",
              }}
            />
          )}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            marginBottom: 16,
          }}
        >
          <div>
            <Label htmlFor="size">Size</Label>
            <Input
              id="size"
              value={form.size}
              onChange={(e) => updateField("size", e.target.value)}
              placeholder="e.g., 3ft × 3ft"
            />
          </div>
          <div>
            <Label htmlFor="material">Material</Label>
            <Input
              id="material"
              value={form.material}
              onChange={(e) => updateField("material", e.target.value)}
              placeholder="e.g., New Zealand Wool"
            />
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <Label htmlFor="intro_text">Introduction Text</Label>
          <Textarea
            id="intro_text"
            value={form.intro_text}
            onChange={(e) => updateField("intro_text", e.target.value)}
            placeholder="A peek behind the scenes of bringing this rug to life..."
            rows={3}
          />
        </div>

        {/* Steps Section */}
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <Label>Crafting Steps</Label>
            <Button
              type="button"
              variant="secondary"
              size="small"
              onClick={addStep}
            >
              + Add Step
            </Button>
          </div>

          {form.steps.map((step, index) => (
            <div
              key={index}
              style={{
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                padding: 16,
                marginBottom: 12,
                background: "rgba(255,255,255,0.03)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: "rgba(255,255,255,0.7)",
                  }}
                >
                  Step {index + 1}
                </span>
                <div style={{ display: "flex", gap: 4 }}>
                  <Button
                    type="button"
                    variant="secondary"
                    size="small"
                    onClick={() => moveStep(index, "up")}
                    disabled={index === 0}
                  >
                    ↑
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="small"
                    onClick={() => moveStep(index, "down")}
                    disabled={index === form.steps.length - 1}
                  >
                    ↓
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    size="small"
                    onClick={() => removeStep(index)}
                  >
                    ✕
                  </Button>
                </div>
              </div>

              <div style={{ marginBottom: 8 }}>
                <Input
                  placeholder="Step title"
                  value={step.title}
                  onChange={(e) => updateStep(index, "title", e.target.value)}
                />
              </div>
              <div style={{ marginBottom: 8 }}>
                <Textarea
                  placeholder="Step description"
                  value={step.description}
                  onChange={(e) =>
                    updateStep(index, "description", e.target.value)
                  }
                  rows={2}
                />
              </div>

              {/* Step Image Upload */}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleStepImageUpload(e, index)}
                  style={{ display: "none" }}
                  id={`step-image-${index}`}
                />
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <Button
                    type="button"
                    variant="secondary"
                    size="small"
                    onClick={() =>
                      document.getElementById(`step-image-${index}`)?.click()
                    }
                    isLoading={uploading.steps[index]}
                  >
                    {step.image_url ? "Change Image" : "Upload Image"}
                  </Button>
                  {step.image_url && (
                    <Button
                      type="button"
                      variant="danger"
                      size="small"
                      onClick={() => updateStep(index, "image_url", "")}
                    >
                      Remove
                    </Button>
                  )}
                </div>
                {step.image_url && (
                  <img
                    src={step.image_url}
                    alt={`Step ${index + 1}`}
                    style={{
                      marginTop: 8,
                      height: 80,
                      width: 80,
                      borderRadius: 4,
                      objectFit: "cover",
                      border: "1px solid #eee",
                    }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 24,
          }}
        >
          <Switch
            id="published"
            checked={form.published}
            onCheckedChange={(checked) => updateField("published", checked)}
          />
          <Label htmlFor="published">Publish story</Label>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 12 }}>
            <Button type="submit" isLoading={updateMutation.isPending}>
              Save Changes
            </Button>
            <Button type="button" variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
          <Button
            type="button"
            variant="danger"
            onClick={handleDelete}
            isLoading={deleteMutation.isPending}
          >
            Delete
          </Button>
        </div>
      </form>
    </Container>
  );
}
