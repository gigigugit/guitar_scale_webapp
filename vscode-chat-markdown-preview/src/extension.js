const vscode = require('vscode');

function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand('chatPreview.open', async () => {
      const panel = vscode.window.createWebviewPanel(
        'chatPreview',
        'Chat Markdown Preview',
        vscode.ViewColumn.Beside,
        {
          enableScripts: true,
          retainContextWhenHidden: true
        }
      );

      panel.webview.html = getWebviewContent(panel.webview);

      panel.webview.onDidReceiveMessage(async (msg) => {
        if (msg.type === 'copy') {
          try {
            await vscode.env.clipboard.writeText(msg.text || '');
            vscode.window.showInformationMessage('Copied to clipboard — paste into Chat input.');
          } catch (err) {
            vscode.window.showErrorMessage('Failed to copy to clipboard: ' + String(err));
          }
        }
      });
    })
  );
}

function deactivate() {}

function getWebviewContent(webview) {
  // Note: For packaged extension, host these scripts locally and use webview.asWebviewUri
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src https: data:; style-src 'unsafe-inline' https:; script-src 'unsafe-inline' https:;">
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Chat Markdown Preview</title>
<style>
  :root{--bg:#ffffff;--muted:#6b7280}
  html,body{height:100%;margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial}
  .container{display:flex;gap:12px;height:100vh;padding:12px;box-sizing:border-box}
  .left{flex:1;display:flex;flex-direction:column}
  textarea{flex:1;min-width:40%;height:100%;padding:10px;font-size:14px;line-height:1.45;border:1px solid #ddd;border-radius:6px;resize:none}
  .preview{flex:1;overflow:auto;padding:12px;border-left:1px solid #e5e7eb;background:var(--bg);border-radius:6px}
  .toolbar{display:flex;gap:8px;margin-bottom:8px}
  button{padding:6px 10px;border-radius:6px;border:1px solid #c7c7c7;background:#fff;cursor:pointer}
  .small{font-size:12px;padding:4px 8px}
  pre{white-space:pre-wrap}
</style>
</head>
<body>
  <div class="container">
    <div class="left">
      <div class="toolbar">
        <button id="copy">Copy to clipboard</button>
        <button id="clear" class="small">Clear</button>
        <div style="flex:1"></div>
        <span style="color:var(--muted);font-size:13px">Live Markdown preview</span>
      </div>
      <textarea id="input" placeholder="Type your message with Markdown…"></textarea>
    </div>
    <div class="preview" id="preview"></div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/dompurify@2.4.0/dist/purify.min.js"></script>
  <script>
    const vscode = acquireVsCodeApi();
    const input = document.getElementById('input');
    const preview = document.getElementById('preview');

    function render() {
      const md = input.value || '';
      try {
        const html = DOMPurify.sanitize(marked.parse(md));
        preview.innerHTML = html;
      } catch (e) {
        preview.textContent = 'Render error: ' + String(e);
      }
    }

    let t;
    input.addEventListener('input', () => { clearTimeout(t); t = setTimeout(render, 120); });

    document.getElementById('copy').addEventListener('click', () => {
      vscode.postMessage({ type: 'copy', text: input.value });
    });
    document.getElementById('clear').addEventListener('click', () => { input.value = ''; render(); });

    // keyboard: Ctrl/Cmd+Enter to copy and notify
    input.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        vscode.postMessage({ type: 'copy', text: input.value });
      }
    });

    // initial sample
    input.value = '';
    render();
  </script>
</body>
</html>`;
}

module.exports = { activate, deactivate };
