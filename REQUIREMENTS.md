# Lost & Found — Project Requirements

## 1. Purpose

Lost & Found is a personal dashboard that turns everyday tasks into visible progress through stars, streaks, achievements, and an evolving collection of skies.

It aims to help users organise their day, recognise their efforts, and build a personal record of what they accomplish.

The experience should feel personal, calm, slightly dreamy, and rewarding rather than competitive or overwhelming.

## 2. Core experience

The central journey is:

**Sign in → Plan → Complete tasks → Collect stars → Discover progress → Choose your sky**

Each part should support the next. Features that do not strengthen this experience should be considered carefully before being added.

## 3. Functional requirements

### Authentication and profile

- Users can sign up and log in using email and password.
- Authentication is handled by Supabase.
- Protected dashboard pages require authentication.
- Users can manage their display name and display preferences.
- The selected sky is saved to the user's profile.

### Task management

- Users can create tasks with a title, description, due date, and focus category.
- Available categories are Build, Learn, Career, Creative, and Health.
- Users can complete or delete tasks.
- Tasks are organised into Today, Carried over, and Later.
- Today's progress counts tasks due today or created today without a due date.

### Progress and recognition

- Completing a task adds a star to the observatory.
- The dashboard displays daily progress and the user's main focus area.
- Streaks count consecutive days with at least one completed task.
- The observatory allows users to explore completed tasks by day.
- Daily star cards show task, learning, reflection, and consistency points.
- Levels and ranks reflect the number of completed tasks.

### Personal discovery

- The dashboard includes an identity snapshot, recent archive entries, and Student Radar.
- The Archive groups completed tasks by day.
- The Curiosity Vault highlights Learn and Creative tasks.
- The Identity Map organises completed tasks by focus category.
- The Observatory provides a larger view of the selected sky.
- The Student Radar is a place where each logged-in user saves and manages their own links.

### Sky Collection

- The collection contains five unlockable skies.
- Skies unlock at 0, 5, 15, 30, and 50 completed tasks.
- Users can select an unlocked sky.
- The selected sky changes the dashboard's hero background.
- The selected choice persists through the user's profile.
- Missing images should not break the page layout.

### Display preferences

- Users can switch between light and dark themes.
- Users can update their display name.
- Existing pages should maintain a consistent visual style.

## 4. Point system

Daily star cards use the following rules:

| Activity | Points |
|---|---:|
| Each completed task | 20 |
| Each completed Learn task | +30 |
| Each completed task with a description | +20 |
| Each day of the streak, for that day's card | +10 |

These badges recognise different aspects of effort; they are not intended to rank users against one another.

## 5. Technical requirements

- Use HTML, CSS, and vanilla JavaScript.
- Use Supabase for authentication and data storage.
- Use Chart.js for the Student Radar chart.
- Keep the project runnable as a static site without a build step.
- Keep database access protected by row-level security.
- Ensure users can access only their own private records.
- Support desktop and narrow mobile layouts.
- Avoid unnecessary dependencies and configuration.

## 6. Design principles

- **Progress over pressure:** Make small accomplishments visible without turning productivity into a competition.
- **Personalisation with meaning:** The Sky Collection should feel like a reward connected to progress, not merely a background picker.
- **Visual consistency:** Preserve the project's distinctive, slightly dreamy atmosphere.
- **Clarity:** Make tasks, progress, navigation, and account status easy to understand.
- **Simplicity:** Prefer improving existing features over adding features without a clear purpose.
- **Reliability:** Existing tasks, saved preferences, and authentication should continue to work as expected.

## 7. Scope boundaries

Lost & Found focuses on personal planning, progress, reflection, and visual personalisation.

It does not need to become a full project-management platform, a social competition, or an all-purpose productivity suite.

New features should have a clear connection to the core experience. Improvements to usability, accessibility, security, and reliability are welcome when they preserve the project's identity.

## 8. Definition of a successful release

A release is successful when:

- Users can sign in and manage their own tasks.
- Completing tasks updates the relevant progress indicators.
- The observatory and daily archive reflect completed work.
- Unlockable skies and saved sky selections behave correctly.
- Existing dashboard pages remain usable and consistent.
- Database access and authentication remain secure.
- The project can be set up using the documented instructions.

The goal is not to have the most features. It is to make the features that matter work together as one coherent experience.
