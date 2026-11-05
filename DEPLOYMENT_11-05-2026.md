# Deployment

## Targets

- GitHub: `https://github.com/alwaysautomating-bit/ai-enablement`
- Vercel project: `alwaysautomating-4729s-projects/ai-enablement`
- Production alias: `https://ai-enablement-xi.vercel.app`
- Deployment ID: `dpl_4FJbNHjRzGX9NJKEbXsdXPLtNjKQ`
- Access: Vercel deployment protection enabled

## Release Process

1. Run `npm test` and `npm run build`.
2. Commit and push `main` to GitHub.
3. Confirm the Vercel project link with `vercel project inspect --non-interactive`.
4. Deploy with `vercel deploy --prod --yes`.
5. Inspect the resulting deployment and verify protected routes with `vercel curl`.

## Runtime Configuration

- `DATABASE_URL=file:/tmp/ai-enablement.db`
- A clean, migrated `prisma/deployment-template.db` is copied into `/tmp` when a Vercel
  runtime starts.
- No provider API keys are required for the deterministic demo path.

## Verification

- Deployment status: `READY`
- Protected `GET /api/runs`: passed
- Local tests: 19 passed
- Local production build: passed with one non-blocking NFT tracing warning

## Limitations

Vercel serverless `/tmp` storage is ephemeral. Hosted records may reset when a runtime is
replaced and may differ between concurrent instances. This deployment is suitable for UI and
workflow evaluation only. It must not receive external pilot, sensitive, or production data.

The production storage gate is managed Postgres with reviewed migrations, backups, tenant
authorization, and cold-start persistence verification.

Last Updated: 11-05-2026
