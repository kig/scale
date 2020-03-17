import { JssStyle } from 'jss';

export const styles: JssStyle = {
  carousel: {
    height: '300px',
    width: '400px',
    position: 'relative',
  },
  carousel__container: {
    position: 'relative',
    height: '100%',
    width: '100%',
    alignItems: 'center',
    display: 'flex',
    margin: '0',
    padding: '0',
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  carousel__slide: {
    position: 'relative',
    height: '100%',
    minWidth: '100%',
    transition: 'all 0.3s ease-in-out',
  },
  carousel__arrow: {
    position: 'absolute',
    top: '50%',
    width: 24,
    height: 24,
    borderRadius: '50%',
    cursor: 'pointer',
    transform: 'translateY(-50%)',
    border: 'none',
    outline: 'none',
    background: 'rgba(31, 45, 61, 0.11)',
    color: '#fff',
    zIndex: 99,
    justifyContent: 'center',
    display: 'flex',
    alignItems: 'center',
  },
  'carousel__arrow--left': {
    left: 12,
  },
  'carousel__arrow--right': {
    right: 12,
  },
  carousel__indicators: {
    position: 'absolute',
    listStyle: 'none',
    margin: 0,
    padding: 0,
    zIndex: 2,
    display: 'inline-flex',
    bottom: 12,
    left: '50%',
    transform: 'translateX(-50%)',
  },
  carousel__indicator: {
    display: 'block',
    opacity: 0.5,
    width: 30,
    height: 4,
    background: '#fff',
    border: 'none',
    outline: 'none',
    padding: 0,
    margin: '0 6px',
    cursor: 'pointer',
    transition: '0.3s',
  },
  'carousel__indicator--active': {
    opacity: 1,
  },
  'carousel--vertical': {
    '& $carousel__container': {
      flexDirection: 'column',
    },
    '& $carousel__arrow': {
      display: 'none',
    },
    '& $carousel__indicators': {
      left: 'unset',
      bottom: 0,
      right: 12,
      top: '50%',
      transform: 'translateY(-50%)',
      display: 'flex',
      flexDirection: 'column',
    },
    '& $carousel__indicator': {
      margin: '6px 0',
      width: 4,
      height: 30,
    },
  },
};