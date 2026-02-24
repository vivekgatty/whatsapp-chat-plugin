import { ContactAvatar } from "@/components/shared/ContactAvatar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import type { Contact } from "@/types";

interface Props {
  contact: Contact;
}

export function ContactCard({ contact }: Props) {
  return (
    <a
      href={`/contacts/${contact.id}`}
      className="flex gap-3 rounded-xl border bg-white p-4 transition-shadow hover:shadow-md"
    >
      <ContactAvatar name={contact.name ?? contact.wa_id} size="md" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium text-gray-900">
            {contact.name ?? contact.profile_name ?? contact.wa_id}
          </span>
          <StatusBadge status={contact.lifecycle_stage} />
        </div>
        <p className="text-sm text-gray-500">{contact.phone}</p>
        {contact.tags.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {contact.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
              >
                {tag}
              </span>
            ))}
            {contact.tags.length > 3 && (
              <span className="text-xs text-gray-400">+{contact.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </a>
  );
}
