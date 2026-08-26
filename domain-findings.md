# Domain and owner access findings

- Public Manus domain currently available: https://situnshop-b3hmcevz.manus.space
- Custom domain www.situnshop.com currently returns DNS_PROBE_FINISHED_NXDOMAIN because it is not registered or has no active DNS records.
- The /admin route is protected and shows an owner login CTA when unauthenticated.
- Clicking the CTA correctly redirects to the Manus OAuth page for SITUN.
- The OAuth page displays a Cloudflare “Verify you are human” challenge; the user must complete this in the browser before continuing with Google or email login.
- The user must use the same Manus account that created the SITUN project. No passwords, email codes, or DNS secrets should be shared in chat.
