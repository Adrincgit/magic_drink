import { useStore } from '@nanostores/react';
import { isEnglish } from '../../data/variables';
import { SceneButton } from './SceneControls';

/**
 * Button - API compartida de enlaces y acciones, con los marcos ilustrados de Magic Drink
 * 
 * @param {Object} props
 * @param {string} props.textEs - Texto en español
 * @param {string} props.textEn - Texto en inglés
 * @param {string} [props.href] - URL de destino (opcional). Si no se proporciona, el botón no navega
 * @param {string} [props.variant='primary'] - Variante del botón: 'primary' | 'secondary' | 'outline' | 'magic'
 * @param {string} [props.size='md'] - Tamaño: 'sm' | 'md' | 'lg'
 * @param {boolean} [props.fullWidth=false] - Si ocupa el 100% del ancho
 * @param {boolean} [props.showArrow=false] - Mostrar flecha al final
 * @param {string} [props.icon] - Icono al inicio (emoji o texto)
 * @param {string} [props.className] - Clases adicionales
 * @param {boolean} [props.external=false] - Si el link es externo (abre en nueva pestaña)
 * @param {Function} [props.onClick] - Función onClick personalizada
 * @param {string} [props.type='button'] - Tipo de botón: 'button' | 'submit'
 * @param {boolean} [props.disabled=false] - Si el botón está deshabilitado
 */
const Button = ({
  textEs,
  textEn,
  href,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  showArrow = false,
  icon,
  className = '',
  external = false,
  onClick,
  type = 'button',
  disabled = false,
}) => {
  const ingles = useStore(isEnglish);
  const text = ingles ? textEn : textEs;

  return (
    <SceneButton
      href={disabled ? undefined : href}
      variant={variant === 'secondary' || variant === 'outline' ? 'violet' : 'gold'}
      size={size}
      fullWidth={fullWidth}
      showArrow={showArrow}
      className={className}
      onClick={onClick}
      type={href && !disabled ? undefined : type}
      disabled={disabled || undefined}
      target={external && href ? '_blank' : undefined}
      rel={external && href ? 'noopener noreferrer' : undefined}
    >
      {icon && <span aria-hidden="true">{icon} </span>}{text}
    </SceneButton>
  );
};

export default Button;
