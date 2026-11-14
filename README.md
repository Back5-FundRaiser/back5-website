# back5-website

The Back5 website (back5.com.au). Plain HTML, CSS and JavaScript, published by Netlify from the `site/` folder. There is no build step.

## Layout
- `site/` the published site. Each page is `site/<address>/index.html`.
- `site/assets/` images, logos, the film loop and the health check scripts.
- `site/assets/health-check.js` shared code for both health checks. The areas, questions and advice for each check live in `club-health-check.js` and `sponsorship-health-check.js`; edit wording there. Every question has four answers ordered weakest to strongest.
- `site/assets/health-check-report.js` draws the PDF scorecard. It embeds Nunito Sans from `site/assets/fonts/` (SIL Open Font License) and the contact photo `site/assets/mark.png`.
- `netlify/functions/health-check.js` creates an Asana task for every completed health check. To see why a task did not arrive, open the function's log in Netlify.
- `site/_redirects` sends addresses from the old site to their new pages.

## Netlify settings
- Forms: turn on form detection. Add an email notification for the `health-check` form.
- Environment variables: `ASANA_TOKEN` and `ASANA_PROJECT_GID`. Never put these in the repo.

## Before launch
- `site/robots.txt` currently blocks search engines. Replace it at launch.
- Replace every bracketed placeholder, for example [PRICING], [COMMISSION %], [CONTACT EMAIL].
- The privacy policy still contains template placeholders.
- The 40 existing articles are not migrated yet; the knowledge hub links to the old site.

## Rules for content
- The club software is described as "exclusive sports management software".
- Colours: black #111116, yellow #EFD018, orange #F4450F, white.
