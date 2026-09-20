import { useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';
import { isEnglish } from '../../data/variables';
import IndexJourney from './Secciones/IndexJourney';

// One island keeps the shared language consistent during hydration.
export default function IndexExperience() {
  const storedEnglish = useStore(isEnglish);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    isEnglish.set(localStorage.getItem('lang') === 'en');
    setReady(true);
  }, []);
  const en = ready && storedEnglish;
  return <IndexJourney en={en} />;
}
