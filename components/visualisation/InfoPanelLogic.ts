AFRAME.registerComponent('info-panel', {
  init: function () {
    // Create the text entity only once
    const textEl = document.createElement('a-entity');
    textEl.setAttribute('text', {
      value: 'Loading...', // Initial text
      align: 'center',
      color: '#000',
      width: 4
    });
    textEl.setAttribute('position', '0 2 -1'); // Adjust this to position correctly relative to your object
    textEl.setAttribute('visible', false); // Start as not visible
    this.el.appendChild(textEl);
    this.textEl = textEl;

    // Listen for clicks to show/hide the info panel
    this.el.addEventListener('click', () => {
      const isVisible = this.textEl.getAttribute('visible');
      this.textEl.setAttribute('visible', !isVisible);
      if (!isVisible) {
        const data = JSON.parse(this.el.getAttribute('data-info'));
        if (data) {
          // Set the text attribute to show the title and description
          const textValue = `Title: ${data.title}\nDescription: ${data.description}`;
          this.textEl.setAttribute('text', 'value', textValue);
        }
      } else {
        // Optionally hide the text when the panel is hidden
        this.textEl.setAttribute('text', 'value', '');
      }
    });
  }
});