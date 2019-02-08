class Keyboard {
    constructor() {
        this.map = {};
        document.addEventListener('keydown', evt => {
            if (evt.keyCode == 9) {
                evt.preventDefault();
            }
            this.map[evt.keyCode] = true;
        });
        document.addEventListener('keyup', evt => {
            this.map[evt.keyCode] = false;
        });
    }
    getKey(code) {
        return !!this.map[code];
    }
    getToggle(code) {
        return !!this.toggleMap[code];
    }
}
var kbrd = new Keyboard();