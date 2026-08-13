# HOW MUCH

`HOW MUCH` is a clickable B2B marketing intelligence mockup for goal-based advertising budget planning.

## What is included

- Landing, goal input, market/company input, analysis, and result dashboard screens
- Mock planning engine with budget recommendation, budget bands, media mix, and what-if interaction
- Vercel serverless API mock routes under `api/`
- Local build script that publishes static assets from `outputs/` to `dist/`

## Run

```bash
npm run build
```

For Vercel, import this repository and keep the default settings. The build command and output directory are already defined in `vercel.json`.

## Environment variables

The mock API checks whether these keys are configured, but does not expose their values:

- `DART_API_KEY`
- `KOSIS_API_KEY`

Set them in Vercel Project Settings if live-data validation is needed later.
