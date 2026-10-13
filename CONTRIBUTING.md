# Contributing to Lost & Found

Thanks for your interest in contributing to Lost & Found!

Lost & Found is a small personal project built around everyday progress, visual discovery, and personalisation. Contributions should preserve that identity while making the project more reliable and easier to use.

## Before you begin

- Read the [README](README.md) to understand the project's purpose.
- Check [REQUIREMENTS.md](REQUIREMENTS.md) before proposing a feature.
- For larger changes, open an issue first so we can discuss the idea before work begins.

## Getting started

### Prerequisites

You'll need:

- A free [Supabase](https://supabase.com/) account.
- A static file server, such as the VS Code Live Server extension, or Node.js to use `npx serve .`.
- An internet connection to load the Supabase and Chart.js libraries from their CDNs.

No build step is required.

### Run locally

1. Fork and clone the repository.
2. Create your own Supabase project.
3. Open the Supabase SQL Editor and run [`supabase/schema.sql`](supabase/schema.sql).
4. Open `js/supabaseClient.js` and replace the project URL and public anon key with the values from your Supabase project's API settings.
5. In Supabase Authentication settings, enable Email as a sign-in provider.
6. Configure the Site URL and redirect URLs to match your local server address.
7. Serve the project directory and open `index.html`.

For example, with Node.js installed:

```bash
npx serve .
```

Use the local address shown by the server. Opening `index.html` directly as a `file://` URL may interfere with authentication redirects.

### Email confirmation

If email confirmation is enabled in Supabase, new users must confirm their email before logging in. You can disable confirmation temporarily for local testing.

## Project structure

```text
index.html, landing.js, landing.css
dashboard.html
missions.html
observatory.html
archive.html
vault.html
radar.html
identity.html
settings.html
style.css
js/
  supabaseClient.js
  app.js
  <page>.js
supabase/
  schema.sql
assets/
  background/
  icons/
```

- `index.html`, `landing.js`, and `landing.css` handle the landing and authentication experience.
- `js/supabaseClient.js` configures the Supabase connection.
- `js/app.js` contains shared dashboard behaviour.
- Individual page scripts handle their respective pages.
- `style.css` provides styling for the logged-in pages.
- `supabase/schema.sql` defines the database tables, permissions, and row-level security policies.

## Database and security

The application uses two tables:

- **`profiles`** — stores profile-related data, including the selected sky.
- **`tasks`** — stores task details, categories, completion status, and timestamps.

When making database changes:

- Update `supabase/schema.sql` to reflect the changes.
- Keep row-level security enabled.
- Ensure users can access only their own private records.
- Preserve the permissions needed for authenticated users to access the tables.

### Protect credentials

The Supabase URL and anon key are intended for client-side use. Their safety depends on correct database permissions and row-level security.

**Never commit a Supabase `service_role` key, passwords, or other private credentials.**

Use your own Supabase project when running the application locally.

## Contribution guidelines

- Keep each contribution focused on one fix or improvement.
- Follow the existing HTML, CSS, and vanilla JavaScript approach.
- Avoid adding libraries or a build system unless there's a clear reason.
- Reuse existing styles and components where practical.
- Preserve the personal, slightly dreamy feel of the project.
- Test changed features in a browser at desktop and narrow mobile widths.
- Check that authentication, data access, and existing pages continue to work when relevant.
- Update the README, requirements, or database schema when a change affects them.

## Reporting a bug

When opening an issue, include:

- What you were trying to do.
- What you expected to happen.
- What actually happened.
- Your browser and any relevant error messages.
- A screenshot, if it helps explain the problem.

## Scope and new features

Lost & Found is not intended to become a generic productivity platform. New ideas should support its central experience: turning everyday effort into visible progress and a personal, evolving sky.

Small improvements that make existing features clearer, more reliable, or more accessible are especially welcome.

## License

By contributing, you agree that your contributions will be distributed under the project's [MIT License](LICENSE).

