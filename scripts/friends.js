const { readSourceData } = require('./lib/data-file');
const { parseFriendsList, renderFriends } = require('./lib/friends');

hexo.extend.filter.register('before_post_render', function (data) {
  if (!data.source || !data.source.replace(/\\/g, '/').endsWith('friends/index.md')) return data;

  const placeholder = '<!-- friends:list -->';
  if (!data.content.includes(placeholder)) return data;

  const friendsSource = readSourceData(hexo, 'friends.md');
  data.content = data.content.replace(placeholder, renderFriends(parseFriendsList(friendsSource)));
  return data;
});
