export const EFFECTS_BOOST=2.8;

export function createEffectsBus(context,output){
 const input=context.createGain(),compressor=context.createDynamicsCompressor();
 input.gain.value=EFFECTS_BOOST;
 compressor.threshold.value=-10;compressor.knee.value=10;compressor.ratio.value=8;
 compressor.attack.value=.002;compressor.release.value=.12;
 input.connect(compressor);compressor.connect(output);
 return input;
}
