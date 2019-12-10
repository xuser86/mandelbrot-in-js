class ColorEditor extends HTMLElement {
  constructor() {
    super();
    this.createTemplate();
  }
  createTemplate() {
    this.attachShadow({mode: 'open'});

    const stylesheet = document.createElement('link');
    stylesheet.setAttribute('rel', 'stylesheet');
    stylesheet.setAttribute('type', 'text/css');
    stylesheet.setAttribute('href', 'css/color-editor.css');
    this.shadowRoot.appendChild(stylesheet);

    this.colorsDiv = document.createElement('div');
    this.shadowRoot.appendChild(this.colorsDiv);

    const addButton = document.createElement('button');
    addButton.setAttribute('type', 'button');
    addButton.textContent = '+';
    addButton.addEventListener('click', () => this.addButtonClick());
    this.shadowRoot.appendChild(addButton);
  }

  addColorInput(data) {
    const colorInput = document.createElement('input');
    colorInput.setAttribute('type', 'color');
    colorInput.setAttribute('value', 
      '#'+data[0].toString(16).padStart(2, '0')
         +data[1].toString(16).padStart(2, '0')
         +data[2].toString(16).padStart(2, '0'));
    colorInput.addEventListener('change', () => this.colorChanged());
    this.colorsDiv.appendChild(colorInput);
  }

  get palette() {
    const paletteInputs = this.colorsDiv.childNodes;
    if (paletteInputs.length === 0) {
      return [];
    }

    const palleteArray = [];
    for (let i = 0; i < paletteInputs.length; i++) {
      const hashColor = paletteInputs[i].value;
      palleteArray.push([
        parseInt(hashColor.substring(1, 3), 16),
        parseInt(hashColor.substring(3, 5), 16),
        parseInt(hashColor.substring(5, 7), 16)
      ]);
    }
    //console.log('get palette', palleteArray);
    return palleteArray;
  }

  set palette(data) {
    this.colorsDiv.innerHTML = ''; // supposingly slow
    for (let i = 0; i < data.length; i++) {
      this.addColorInput(data[i]);
    }
  }
  addButtonClick() {
    this.addColorInput([0,0,0]);
    this.colorChanged();
  }
  colorChanged() {
    this.dispatchEvent(new CustomEvent('change', {
      detail: this.palette
    }));
  }
}

customElements.define('color-editor', ColorEditor);
//export {ColorEditor};