// InfoPanelLogic.js (or directly in your svelte component inside a <script> tag)
AFRAME.registerComponent('info-panel', {
  init: function () {
    // Create the text entity only once
    const textEl = document.createElement('a-entity');
    textEl.setAttribute('text', {
      value: 'Loading...',
      align: 'center',
      color: '#000',
      width: 4
    });
    textEl.setAttribute('position', '0 2 0'); // Adjust this to position correctly relative to your object
    textEl.setAttribute('visible', false); // Start as not visible
    this.el.appendChild(textEl);
    this.textEl = textEl;

    // Listen for clicks to show/hide the info panel
    this.el.addEventListener('click', () => {
      let isVisible = this.textEl.getAttribute('visible');
      this.textEl.setAttribute('visible', !isVisible);
      if (!isVisible) {
        let data = this.el.getAttribute('data-info');
        if (data) {
          this.textEl.setAttribute('text', 'value', `Title: ${data.title}\nDescription: ${data.description}`);
        }
      }
    });
  }
});
