export default function Head() {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `
          (function() {
            try {
              if (document.getElementById('trig-events-fab')) return;
              function addFab() {
                try {
                  var a = document.createElement('a');
                  a.id = 'trig-events-fab';
                  a.href = '/dashboard/analytics/triggers';
                  a.textContent = 'Trigger events';
                  a.setAttribute('aria-label', 'Trigger events');
                  a.style.cssText = [
                    'position:fixed',
                    'right:16px',
                    'bottom:16px',
                    'z-index:9999',
                    'padding:10px 14px',
                    'border-radius:9999px',
                    'background:#f59e0b',   /* amber-500 */
                    'color:#111',
                    'font-weight:600',
                    'text-decoration:none',
                    'box-shadow:0 6px 18px rgba(0,0,0,.25)',
                    'font-size:14px',
                    'line-height:1'
                  ].join(';');
                  document.body.appendChild(a);
                } catch (e) { /* no-op */ }
              }
              if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', addFab, { once: true });
              } else {
                addFab();
              }
            } catch (e) { /* no-op */ }
          })();
        `,
        }}
      />
    </>
  );
}