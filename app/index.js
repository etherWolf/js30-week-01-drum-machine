import { Knob, Ui } from './knob';
import '../assets/styles/main.scss';

// eslint-disable

const Machine = {
  init() {
    this.machineOn = false;
    this.lastSoundTime = 0;

    const knobEl = document.querySelector('.volume__pointer');
    this.createKnob(knobEl);

    knobEl.addEventListener('change', this.changeVolume.bind(this));

    document.querySelectorAll('audio').forEach((ae) => {
      ae.volume = 0.5;
    });

    document
      .querySelector('.power-button')
      .addEventListener('click', this.togglePower.bind(this));

    document.querySelectorAll('.drum-pad').forEach((x) => {
      x.addEventListener('click', this.onPadClicked.bind(this));
      x.addEventListener('transitionend', this.removeTransition);
    });

    window.addEventListener('keydown', this.onKeyPressed.bind(this));
  },

  onPadClicked(e) {
    const keyCode = e.target.dataset.key;
    this.play(e.target, keyCode);
  },

  onKeyPressed(e) {
    const padEl = document.querySelector(`div[data-key="${e.keyCode}"]`);
    this.play(padEl, e.keyCode);
  },

  removeTransition(e) {
    if (e.propertyName !== 'opacity') return;
    e.target.classList.remove('drum-pad--active');
  },

  play(padEl, keyCode) {
    if (!this.machineOn) return;
    const audio = document.querySelector(`audio[data-key="${keyCode}"]`);
    if (!audio) return;

    audio.currentTime = 0;
    audio.play();
    padEl.classList.add('drum-pad--active');
    const text = padEl.querySelector('.drum-pad__text').innerText;
    document.querySelector('.display__tone').innerText = text;
    if (this.lastSoundTime) {
      const millis = Date.now() - this.lastSoundTime;
      const x = Math.floor(60 / (millis / 1000));
      if (x > 999) {
        document.querySelector('.display__bpm').innerText = '*WTF* BPM';
        this.lastSoundTime = 0;
        return;
      }
      document.querySelector('.display__bpm').innerText = `${x} BPM`;
    }
    this.lastSoundTime = Date.now();
  },

  changeVolume(e) {
    for (let i = 1; i <= 10; i++) {
      const notchEl = document.querySelector(`.volume__indicator-notch-${i}`);
      if (i <= e.target.value)
        notchEl.classList.add('volume__indicator-notch--lit');
      else notchEl.classList.remove('volume__indicator-notch--lit');
    }
    document.querySelectorAll('audio').forEach((ae) => {
      ae.volume = e.target.value / 10.0;
    });
  },

  togglePower() {
    document
      .querySelector('.power-button')
      .classList.toggle('power-button--on');
    document.querySelector('#drum-machine').classList.toggle('machine--off');
    document.querySelectorAll('.drum-pad__key').forEach((x) => {
      x.classList.toggle('drum-pad__key--lit');
    });
    this.machineOn = !this.machineOn;
    if (this.machineOn) {
      document.querySelector('.display__tone').innerText = 'WELCOME';
      document.querySelector('.display__bpm').innerText = '0 BPM';
    }
  },

  createKnob(knobEl) {
    const PointerKnob = function () {};
    PointerKnob.prototype = Object.create(Ui.prototype);
    PointerKnob.prototype.createElement = function () {
      Ui.prototype.createElement.apply(this, arguments);
      this.addComponent(new Ui.Pointer({
        type: 'Rect',
        pointerWidth: 3,
        pointerHeight: this.width / 10,
        offset: this.width * 0.15,
      }));
      this.el.node.setAttribute('class', 'knob');
    };
    new Knob(knobEl, new PointerKnob());
  },
};

const machine = Object.create(Machine);
machine.init();
