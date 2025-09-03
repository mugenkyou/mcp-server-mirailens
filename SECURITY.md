# Security Policy

## Supported Versions

We release patches to fix security vulnerabilities. Which versions are eligible for such patches depends on the CVSS v3.0 Rating:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of MiraiLens seriously. If you believe you have found a security vulnerability, please report it to us as described below.

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to [security@mirailens.io](mailto:security@mirailens.io).

You should receive a response within 48 hours. If for some reason you do not, please follow up via email to ensure we received your original message.

Please include the requested information listed below (as much as you can provide) to help us better understand the nature and scope of the possible issue:

- Type of issue (buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the vulnerability
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

This information will help us triage your report more quickly.

## Preferred Languages

We prefer all communications to be in English.

## Policy

MiraiLens follows the principle of [Responsible Disclosure](https://en.wikipedia.org/wiki/Responsible_disclosure).

## Security Considerations

### Browser Extension

- The extension only runs on user-initiated actions
- Scripts are injected with minimal privileges
- All communication is local to your machine
- No data is sent to external servers

### MCP Server

- The server only accepts local connections by default
- No authentication is required for local development use
- For production deployment, implement appropriate security measures

### General Security

- Keep dependencies updated
- Use HTTPS for any external communications
- Implement proper input validation
- Follow security best practices for web applications

## Disclosure Timeline

- **48 hours**: Initial response to vulnerability report
- **7 days**: Status update and timeline for fix
- **30 days**: Target fix release date
- **90 days**: Public disclosure if no fix is available

## Credits

Security researchers who report valid vulnerabilities will be credited in our security advisories and release notes.

## Contact

- **Security Email**: [security@mirailens.io](mailto:security@mirailens.io)
- **PGP Key**: Available upon request
- **GitHub Security**: Use the email above for security issues

---

Thank you for helping keep MiraiLens and our users secure!
