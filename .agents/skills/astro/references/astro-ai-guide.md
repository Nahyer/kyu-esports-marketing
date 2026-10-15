# Building Astro sites with AI tools

Source: [Astro Documentation: Build with AI](https://docs.astro.build/en/guides/build-with-ai/)

AI-powered editors and agentic coding tools generally have good knowledge of Astro’s core APIs and concepts. However, some may use older APIs and may not be aware of newer features or recent changes to the framework.

This guide covers how to enhance AI tools with up-to-date Astro knowledge and provides best practices for building Astro sites with AI assistance.

## Astro Docs MCP Server

You can ensure your AI tools have current Astro knowledge through the Astro Docs MCP (Model Context Protocol) server. This provides real-time access to the latest documentation, helping AI tools avoid outdated recommendations and ensuring they understand current best practices.

### What is MCP?

[Model Context Protocol](https://modelcontextprotocol.io/) (MCP) is a standardized way for AI tools to access external tools and data sources.

Unlike AI models trained on static data, the MCP server provides access to the latest Astro documentation. The server is free, open-source, and runs remotely with nothing to install locally.

The Astro Docs MCP server uses the [kapa.ai](https://www.kapa.ai/) API to maintain an up-to-date index of the Astro documentation.

### Server Details
- **Name**: Astro Docs
- **URL**: `https://mcp.docs.astro.build/mcp`
- **Transport**: Streamable HTTP / SSE

### Google Antigravity Setup
Open `~/.gemini/antigravity/mcp_config.json`.
Add the following configuration to `mcp_config.json`:
```json
{
  "mcpServers": {
    "astro-docs": {
      "serverUrl": "https://mcp.docs.astro.build/mcp"
    }
  }
}
```
Save the file and refresh in the Manage MCPs tab.

---

## Tips for AI-Powered Astro Development

1. **Start with templates**: Rather than building from scratch, ask AI tools to start with an existing [Astro template](https://astro.build/themes/) or use `npm create astro@latest` with a template option.
2. **Use `astro add` for integrations**: Ask AI tools to use `astro add` for official integrations (e.g. `astro add tailwind`, `astro add react`). For other packages, install using the command for your preferred package manager rather than editing `package.json` directly.
3. **Verify current APIs**: AI tools may use outdated patterns. Ask them to check the latest documentation, especially for newer features like sessions and actions. This is also important for features that have seen significant changes since their initial launch, such as content collections, or previously experimental features that may no longer be experimental.
4. **Use project rules**: If your AI tool supports it, set up project rules to enforce best practices and coding standards, such as the ones listed above.

---

## Background Mode
When an AI coding agent is detected on macOS and Linux, `astro dev` and `astro preview` automatically start the server as a detached background process.

On Windows, or without an AI coding agent, the server starts in the foreground and logs to the terminal. You can still opt in explicitly by passing the `--background` flag or setting `ASTRO_DEV_BACKGROUND=1`.

A lock file (`.astro/dev.json` or `.astro/preview.json`) is written when the server starts, recording the server’s URL, port, and PID. This prevents duplicate servers from being started for the same project.

To opt out of automatic background mode, set the `ASTRO_DEV_BACKGROUND` or `ASTRO_PREVIEW_BACKGROUND` environment variable before running the command:
```bash
ASTRO_DEV_BACKGROUND=0 astro dev
ASTRO_PREVIEW_BACKGROUND=0 astro preview
```

---

## Health Endpoint
The dev server exposes a `/_astro/status` endpoint that returns `{"ok": true}` as JSON. This allows agents and other tools to check programmatically whether the dev server is ready to accept requests. This endpoint is only available in the dev server and does not exist in production builds.

---

## Discord AI Support
The same technology that powers Astro’s MCP server is also available as a chatbot in the [Astro Discord](https://astro.build/chat) for self-serve support in `#support-ai`.
