import clsx from 'clsx';

import styles from '../styles/WaypointOverlay.module.css';

export default function WaypointOverlay({
  items = [],
  activeId = null,
  blocked = false,
  onActivate,
}) {
  return (
    <div
      className={clsx(styles.layer, {
        [styles.blocked]: blocked,
      })}
      aria-label="Garden waypoints"
    >
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className={clsx(styles.marker, {
            [styles.hidden]: !item.visible,
            [styles.active]: activeId === item.id,
            [styles.sideLeft]: item.side === 'left',
            [styles.sideRight]: item.side !== 'left',
          })}
          style={{
            left: `${item.x}px`,
            top: `${item.y}px`,
            '--waypoint-color': item.color,
            '--waypoint-label': item.labelColor,
            '--waypoint-ink': item.inkColor,
          }}
          onClick={() => onActivate(item.id)}
          disabled={blocked || !item.visible}
          tabIndex={blocked || !item.visible ? -1 : 0}
          aria-expanded={activeId === item.id}
          aria-haspopup="dialog"
          aria-label={item.label}
        >
          <span className={styles.diamond} aria-hidden="true" />
          <span className={styles.label}>{item.label}</span>
        </button>
      ))}
    </div>
  );
}
