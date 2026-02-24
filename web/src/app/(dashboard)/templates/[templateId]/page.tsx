import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { WhatsAppPreview } from "@/components/shared/WhatsAppPreview";

interface Props {
  params: Promise<{ templateId: string }>;
}

export default async function TemplateDetailPage({ params }: Props) {
  const { templateId } = await params;
  const supabase = createClient();

  const { data: template } = await supabase
    .from("templates")
    .select("*")
    .eq("id", templateId)
    .single();

  if (!template) redirect("/templates");

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{template.display_name}</h1>
          <div className="mt-1 flex gap-2">
            <StatusBadge status={template.meta_template_status} />
            <span className="text-sm text-gray-500">{template.category}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700">Meta Name</h3>
            <p className="font-mono text-sm text-gray-900">
              {template.meta_template_name ?? template.name}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700">Body</h3>
            <p className="text-sm whitespace-pre-wrap text-gray-900">{template.body_text}</p>
          </div>
          {template.footer_text && (
            <div>
              <h3 className="text-sm font-medium text-gray-700">Footer</h3>
              <p className="text-sm text-gray-500">{template.footer_text}</p>
            </div>
          )}
          <div>
            <h3 className="text-sm font-medium text-gray-700">Usage</h3>
            <p className="text-sm text-gray-500">Used {template.times_used} times</p>
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-medium text-gray-700">Preview</h3>
          <WhatsAppPreview body={template.body_text} />
        </div>
      </div>
    </div>
  );
}
