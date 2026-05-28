const { escapeHtml } = require('./html');

function parseFriendsList(source) {
  const friends = [];
  let current = null;

  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trim();
    const item = line.match(/^-\s+name:\s*(.+)$/);
    const field = line.match(/^(url|desc|image):\s*(.+)$/);

    if (item) {
      if (current) friends.push(current);
      current = { name: item[1].trim() };
      continue;
    }

    if (field && current) {
      current[field[1]] = field[2].trim();
    }
  }

  if (current) friends.push(current);
  return friends.filter(friend => friend.name && friend.url);
}

function renderFriends(friends) {
  const cards = friends.map(friend => {
    const name = escapeHtml(friend.name);
    const url = escapeHtml(friend.url);
    const desc = escapeHtml(friend.desc);
    const image = escapeHtml(friend.image);

    return `  <div class="friend-item-wrap">
    <a href="${url}" rel="external nofollow noopener noreferrer" target="_blank" aria-label="${name}"></a>
    <div class="friend-icon"><img src="${image}" alt="${name}"></div>
    <div class="friend-info-wrap">
      <div class="friend-name">${name}</div>
      <div class="friend-desc">${desc}</div>
    </div>
  </div>`;
  }).join('\n\n');

  return `<div class="friend-wrap">\n${cards}\n</div>`;
}

module.exports = {
  parseFriendsList,
  renderFriends
};
