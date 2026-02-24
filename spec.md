# Specification

## Summary
**Goal:** Add an AI story generation feature to StoryWave that lets authenticated users generate full stories from a category, tone, and optional prompt, then review and publish them.

**Planned changes:**
- Add a `generateStory(category, tone, prompt)` function to the Motoko backend actor that returns a story object with `title`, `description`, and `narrativeBody` fields and saves it as a draft linked to the caller's principal.
- Return an error variant if the caller is not authenticated.
- Add a toggle/tab on the Create page to switch between "Manual" and "AI Generate" modes.
- Add an AI Generate form with a category dropdown, tone dropdown (Dark, Uplifting, Funny, Suspenseful, Inspirational), and an optional prompt textarea.
- Show a loading skeleton while the backend generates the story.
- Pre-fill editable title, description, and narrative body fields with the generated content on success.
- Allow the user to publish the generated story using the existing Publish button flow.
- Show a login prompt if the user is not authenticated when accessing the AI Generate form.
- Show a user-friendly error message with a retry option if generation fails.
- Display AI-generated draft stories in the user's "My Stories" library tab with a "Draft" badge.

**User-visible outcome:** Users can navigate to the Create page, switch to AI Generate mode, select a category and tone, optionally enter a prompt, and receive a fully generated story they can edit and publish to StoryWave.
