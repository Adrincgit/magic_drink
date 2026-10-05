import { useRef, useState } from 'react';
import usePlazaDialog from './usePlazaDialog';
import IllustratedMenu, { IllustratedMenuTrigger } from '../../global/IllustratedMenu';
import styles from '../css/journeyMenu.module.css';

export default function JourneyMenu({ en, ready, finish, onFinishChange }) {
  const dialog = useRef(null);
  const [opened, setOpened] = useState(false);
  const { open, close } = usePlazaDialog(dialog);
  return <>
    <IllustratedMenuTrigger en={en} className={styles.trigger} data-journey-menu-trigger disabled={!ready}
      aria-haspopup="dialog" aria-controls="journey-menu" aria-expanded={opened}
      onClick={() => { open(); setOpened(true); }} />
    <IllustratedMenu dialogRef={dialog} id="journey-menu" en={en} currentPath="/" data-journey-menu
      finish={finish} onFinishChange={onFinishChange} onClose={close} onClosed={() => setOpened(false)}
      resume={en ? 'Back to the journey' : 'Seguir el recorrido'} />
  </>;
}
