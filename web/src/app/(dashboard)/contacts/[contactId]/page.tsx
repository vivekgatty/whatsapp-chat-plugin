import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ContactTimeline } from "../components/ContactTimeline";
import { CustomFieldEditor } from "../components/CustomFieldEditor";
import { OrderHistory } from "../components/OrderHistory";
import { ContactAvatar } from "@/components/shared/ContactAvatar";
import { StatusBadge } from "@/components/shared/StatusBadge";

interface Props {
  params: Promise<{ contactId: string }>;
}

export default async function ContactDetailPage({ params }: Props) {
  const { contactId } = await params;
  const supabase = createClient();

  const { data: contact } = await supabase
    .from("contacts")
    .select("*")
    .eq("id", contactId)
    .single();

  if (!contact) redirect("/contacts");

  return (
    <div className="p-6">
      <div className="mb-6 flex items-start gap-4">
        <ContactAvatar name={contact.name ?? contact.wa_id} size="lg" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {contact.name ?? contact.profile_name ?? contact.wa_id}
          </h1>
          <p className="text-sm text-gray-500">{contact.phone}</p>
          <div className="mt-1 flex gap-2">
            <StatusBadge status={contact.lifecycle_stage} />
            <StatusBadge status={contact.status} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ContactTimeline contactId={contactId} />
        </div>
        <div className="space-y-6">
          <CustomFieldEditor contactId={contactId} fields={contact.custom_fields} />
          <OrderHistory contactId={contactId} />
        </div>
      </div>
    </div>
  );
}
