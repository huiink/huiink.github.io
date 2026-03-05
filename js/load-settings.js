function loadSettings() {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'light' || storedTheme === 'dark') {
        document.documentElement.setAttribute('theme', storedTheme);
    } else {
        document.documentElement.setAttribute('theme', 'dark');
    }

    let showBanner = localStorage.getItem('showBanner');
    if (showBanner == null || showBanner == undefined || showBanner == 'true') {
        document.documentElement.setAttribute('showBanner', true);
    } else {
        document.documentElement.setAttribute('showBanner', false);
    }
}
loadSettings();
