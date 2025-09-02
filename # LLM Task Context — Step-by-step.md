# LLM Task Context — Step-by-step

## Prerequisites (must be provided to the LLM)

* `JIRA_BASE_URL` (https://mailtosathyac.atlassian.net)
* `JIRA_TICKET` (SCRUM-2)
* `GITHUB_REPO` (owner/repo)
* `WORKSPACE_PATH` (/Users/sathyac/Projects/test-workspace/)
* `GIT_AUTHOR_NAME` and `GIT_AUTHOR_EMAIL`
* `GITHUB_DEFAULT_BRANCH` (main)
* `GITHUB_PR_REVIEWERS` (optional)

## Step-by-step tasks

1. **Validate inputs** — confirm all prerequisites exist. If any are missing or credentials lack access, post a concise comment on the Jira ticket describing the missing item and stop.

2. **Fetch Jira ticket** — retrieve `summary`, `description`, `acceptance criteria`, `attachments`, `labels`, `assignee`, `reporter`, and `priority`.

3. **Save audit copy** — write the full Jira JSON to `WORKSPACE_PATH/.mcp/jira/${JIRA_TICKET}.json` for traceability.

4. **Parse the description** — extract: goal/problem, steps-to-reproduce, explicit acceptance criteria, constraints, and expected inputs/outputs. Map each acceptance criterion to at least one test or verification step.

5. **Create a short plan** — produce a 3–8 bullet implementation plan describing exactly what will change. If the ticket is ambiguous or underspecified, post this plan to Jira and wait for confirmation before proceeding.

6. **Prepare the repository** — clone `https://github.com/${GITHUB_REPO}` into `WORKSPACE_PATH` or update the existing local copy. Detect project type (package.json, pom.xml, go.mod, etc.) and determine build/test commands.

7. **Create a branch** — use the naming convention: `mcp/${JIRA_TICKET}/<short-hyphen-summary>` and switch to it.

8. **Implement minimal changes** — modify only the files required to satisfy the acceptance criteria. Add or update unit/integration tests that validate the criteria. Respect project style, linters, and CODEOWNERS.

9. **Run linters & tests** — execute project tests and linters. If tests fail due to the change, fix them. If failures are unrelated or flaky, document them in the PR and Jira comment.

10. **Commit changes** — use commit message format:

* First line: `${JIRA_TICKET}: short summary` (<=80 chars)
* Body: brief description, bullet list of changes, and `Jira: ${JIRA_BASE_URL}/browse/${JIRA_TICKET}`.

11. **Push branch** — push the branch to origin.

12. **Create PR** — open a Pull Request with:

* Title: `${JIRA_TICKET}: <short summary>`
* Body: include Jira link, list of changes, test instructions, assumptions, and acceptance criteria mapping.
* Add label `jira/${JIRA_TICKET}` and appropriate semantic labels; request reviewers.

13. **Update Jira** — post a comment with branch name, PR URL, and commit SHA. Transition the ticket to the appropriate status (e.g. In Review) if permitted.

14. **Write audit record** — save `WORKSPACE_PATH/.mcp/audit/${JIRA_TICKET}.md` containing the Jira dump, branch name, commit SHAs, PR URL, and timestamps.

15. **Decision points (stop & ask humans)** — stop and request human input (post to Jira) if any of the following apply:

* Change requires production DB migration or coordinated deployment
* Change touches security/auth/encryption or secrets handling
* Multiple repositories must be changed together
* Acceptance criteria are insufficient to implement safely

16. **Secrets policy** — never commit credentials or secrets. Use environment variables for API calls and avoid printing tokens in logs or comments.

17. **Traceability rule** — every code change must reference the Jira ticket and be reproducible from the audit record.

## End of context
