export default function DocsPage() {
  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Help Center</h1>

      <div className="space-y-6">
        {[
          {
            title: "Getting Started",
            items: [
              "Connect your WhatsApp Business account via Meta Embedded Signup",
              "Complete your business profile and select your industry",
              "Invite team members and assign roles",
              "Create your first message template",
            ],
          },
          {
            title: "Managing Conversations",
            items: [
              "Use the inbox to view and reply to messages",
              "Assign conversations to team members",
              "Use quick replies with /shortcuts for faster responses",
              "Add labels to organize conversations",
            ],
          },
          {
            title: "Automation",
            items: [
              "Set up keyword-based auto-replies",
              "Create follow-up rules for unresponsive contacts",
              "Auto-assign conversations with round-robin",
              "Send scheduled reminders and notifications",
            ],
          },
          {
            title: "Broadcasts",
            items: [
              "Select an approved template and target audience",
              "Schedule broadcasts for optimal delivery times",
              "Track delivery, read, and reply rates",
              "Segment contacts by tags or custom filters",
            ],
          },
        ].map((section) => (
          <div key={section.title} className="rounded-xl border bg-white p-6">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">{section.title}</h2>
            <ul className="space-y-2">
              {section.items.map((item) => (
                <li key={item} className="text-sm text-gray-600">
                  • {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
