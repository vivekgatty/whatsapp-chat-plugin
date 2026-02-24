const SECTIONS = [
  {
    href: "/settings/workspace",
    label: "Workspace",
    description: "Business profile and industry configuration",
  },
  { href: "/settings/whatsapp", label: "WhatsApp", description: "Manage your WhatsApp connection" },
  { href: "/settings/team", label: "Team", description: "Agents, roles, and permissions" },
  {
    href: "/settings/quick-replies",
    label: "Quick Replies",
    description: "Manage /shortcut canned responses",
  },
  { href: "/settings/labels", label: "Labels", description: "Conversation labels and colors" },
  {
    href: "/settings/custom-fields",
    label: "Custom Fields",
    description: "Define custom contact fields",
  },
  {
    href: "/settings/business-hours",
    label: "Business Hours",
    description: "Set your operating hours",
  },
  { href: "/settings/notifications", label: "Notifications", description: "Alert preferences" },
  {
    href: "/settings/integrations",
    label: "Integrations",
    description: "Webhooks and external tools",
  },
  { href: "/settings/billing", label: "Billing", description: "Plans, usage, and invoices" },
];

export default function SettingsPage() {
  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Settings</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map((s) => (
          <a
            key={s.href}
            href={s.href}
            className="rounded-xl border bg-white p-5 transition-shadow hover:shadow-md"
          >
            <h3 className="font-semibold text-gray-900">{s.label}</h3>
            <p className="mt-1 text-sm text-gray-500">{s.description}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
