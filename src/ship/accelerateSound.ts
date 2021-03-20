
const audio = new Audio();
audio.src = accelerateMp3;

export const accelerateSound = () => {
  audio.loop = true;
  audio.volume = 0.2;
  audio.play();
};

export const stopAccelerateSound = () => {
  audio.pause();
};