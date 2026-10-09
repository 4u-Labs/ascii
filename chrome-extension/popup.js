document.addEventListener('DOMContentLoaded', () => {
  const btnOpen = document.getElementById('btnOpenWeb');
  if (btnOpen) {
    btnOpen.addEventListener('click', () => {
      if (typeof chrome !== 'undefined' && chrome.tabs) {
        chrome.tabs.create({ url: 'https://nova4u.ai.br/app/ascii/index.php' });
      } else {
        window.open('index.php', '_blank');
      }
    });
  }
});
