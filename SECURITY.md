# Security Policy

## Reporting a vulnerability

Please do not post credentials, customer data, or exploitable security details in a public issue. Contact the repository maintainers privately through a trusted channel and include a concise description, affected area, and safe reproduction steps.

## Security baseline

- Never commit real secrets, access tokens, database credentials, or production customer data.
- Apply server-side authorization to every protected operation and document download.
- Use least-privilege accounts and private storage.
- Keep dependencies updated and review automated security findings.
- Validate file uploads and request payloads.
- Maintain backups and test restoration.
- Do not use this project with sensitive production records until security and quality workflows have been reviewed and tested.
