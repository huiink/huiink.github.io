const { readSourceJson } = require('./lib/data-file');

const defaultConfig = {
  repo: '',
  repoId: '',
  category: 'General',
  categoryId: '',
  mapping: 'pathname',
  strict: '0',
  reactionsEnabled: '1',
  emitMetadata: '0',
  inputPosition: 'bottom',
  lang: 'zh-TW',
  loading: 'lazy'
};

function giscusCard(config) {
  const serializedConfig = JSON.stringify({ ...defaultConfig, ...config });

  return `
<div id="comment-card" class="comment-card">
  <div class="main-title-bar">
    <div class="main-title-dot"></div>
    <div class="main-title">Comments</div>
  </div>
  <div id="giscus_thread"></div>
  <script>
    (function () {
      const giscusConfig = ${serializedConfig};

      function currentTheme() {
        const explicitTheme = document.documentElement.getAttribute('theme');
        if (explicitTheme === 'dark') return "dark";
        if (explicitTheme === 'light') return "light";
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          return "dark";
        }
        return "light";
      }

      function mountGiscus() {
        const host = document.getElementById('giscus_thread');
        if (!host || host.querySelector('script[src="https://giscus.app/client.js"]')) return;

        const script = document.createElement('script');
        script.src = 'https://giscus.app/client.js';
        script.async = true;
        script.crossOrigin = 'anonymous';
        script.setAttribute('data-repo', giscusConfig.repo);
        script.setAttribute('data-repo-id', giscusConfig.repoId);
        script.setAttribute('data-category', giscusConfig.category);
        script.setAttribute('data-category-id', giscusConfig.categoryId);
        script.setAttribute('data-mapping', giscusConfig.mapping);
        script.setAttribute('data-strict', giscusConfig.strict);
        script.setAttribute('data-reactions-enabled', giscusConfig.reactionsEnabled);
        script.setAttribute('data-emit-metadata', giscusConfig.emitMetadata);
        script.setAttribute('data-input-position', giscusConfig.inputPosition);
        script.setAttribute('data-theme', currentTheme());
        script.setAttribute('data-lang', giscusConfig.lang);
        script.setAttribute('data-loading', giscusConfig.loading);
        host.appendChild(script);
      }

      function syncGiscusTheme() {
        const iframe = document.querySelector('iframe.giscus-frame');
        if (!iframe || !iframe.contentWindow) return;
        iframe.contentWindow.postMessage(
          { giscus: { setConfig: { theme: currentTheme() } } },
          'https://giscus.app'
        );
      }

      mountGiscus();

      const observer = new MutationObserver(function (mutations) {
        for (const mutation of mutations) {
          if (mutation.attributeName === 'theme') syncGiscusTheme();
        }
      });
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['theme']
      });

      window.addEventListener('load', function () {
        syncGiscusTheme();
        setTimeout(syncGiscusTheme, 800);
      });
    })();
  </script>
</div>`;
}

hexo.extend.filter.register('after_post_render', function (data) {
  if (data.comments === false) return data;
  if (data.layout !== 'post' && data.layout !== 'page') return data;

  data.content += giscusCard(readSourceJson(hexo, 'giscus.json', defaultConfig));
  return data;
});
