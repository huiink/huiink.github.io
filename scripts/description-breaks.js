function restoreDescriptionBreaks(html) {
  return html.replace(
    /(<div class="truncate-text">\s*)([\s\S]*?)(\s*<\/div>)/g,
    (match, open, body, close) => {
      if (body.includes('<br')) return match;

      const lines = body
        .replace(/\r\n/g, '\n')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);

      if (lines.length <= 1) return match;

      return `${open}${lines.join('<br>')}<br>${close}`;
    }
  );
}

hexo.extend.filter.register('after_render:html', function (html) {
  return restoreDescriptionBreaks(html);
});
