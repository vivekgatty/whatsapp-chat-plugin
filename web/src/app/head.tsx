export default function Head() {
  return (
    <>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />

      {/* Base SEO */}
      <title>ChatMadi — WhatsApp Chat Plugin for Websites</title>
      <meta
        name="description"
        content="Add a WhatsApp chat bubble to your website in minutes. Copy-paste one script, customize the button, auto-reply with multilingual templates, track analytics, and capture leads."
      />
      <meta name="robots" content="index,follow" />

      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />

      {/* Open Graph (defaults; pages can override) */}
      <meta property="og:site_name" content="ChatMadi" />
      <meta property="og:title" content="ChatMadi — WhatsApp Chat Plugin for Websites" />
      <meta
        property="og:description"
        content="Install a WhatsApp chat widget, customize UI, set business hours & multilingual auto-replies, and track performance."
      />
      <meta property="og:type" content="website" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="ChatMadi — WhatsApp Chat Plugin for Websites" />
      <meta
        name="twitter:description"
        content="Copy-paste install, customizable UI, multilingual templates, analytics, and leads."
      />

      {/* Canonical: inject based on current path (keeps canonical correct per page) */}
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){
            try {
              var path = location.pathname.replace(/\\/$/, '');
              var href = location.origin + (path || '/');
              var link = document.querySelector('link[rel="canonical"]');
              if (!link) { link = document.createElement('link'); link.setAttribute('rel','canonical'); document.head.appendChild(link); }
              link.setAttribute('href', href);
            } catch (e) {}
          })();`,
        }}
      />
    </>
  );
}
