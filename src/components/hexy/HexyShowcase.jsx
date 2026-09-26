import HexyAudioProvider from './components/HexyAudioProvider';
import HexyWorld from './HexyWorld';

export default function HexyShowcase() {
  return (
    <HexyAudioProvider>
      <HexyWorld />
    </HexyAudioProvider>
  );
}
