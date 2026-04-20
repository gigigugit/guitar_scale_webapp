# Chat Markdown Preview — VS Code Extension (Standalone Template)

This small extension opens a Webview panel that provides a textarea (or small editor) and a live Markdown preview. It's intended as a separate project — keep it outside your main app.

Usage

- Open this folder in VS Code (or add to existing workspace).
- Press `F5` to run the Extension Development Host.
- Run the `Chat Input: Open Markdown Preview` command from the Command Palette.
- Type Markdown in the left pane, see rendered preview on the right.
- Click "Copy to clipboard" to copy the raw Markdown text, then paste into the VS Code Chat input.

Notes

- This template uses `marked` and `DOMPurify` via CDN in the Webview for simplicity. For production packaging, bundle dependencies into the extension media folder and use `webview.asWebviewUri`.
- The extension intentionally does not attempt to inject into or modify the built-in Chat UI. It provides a separate panel for composing messages and safely copying them into Chat.

Files

- `package.json` — extension manifest.
- `src/extension.js` — activation/command and webview implementation.

License

Use as you like; change the `publisher` field in `package.json` before publishing.
