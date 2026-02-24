import { useAppContext } from '../context/AppContext';
import { themes } from '../data/themes';
import { IconRenderer } from './IconRenderer';

export function Background() {
  const { activeThemeId } = useAppContext();
  const theme = themes.find(t => t.id === activeThemeId) || themes[0];

  if (theme.type === 'pattern') {
    return (
      <svg className="fixed inset-0 w-full h-full -z-10 pointer-events-none transition-colors duration-500" style={{ backgroundColor: theme.bg }}>
        <defs>
          <pattern id="bg-pattern" width="64" height="64" patternUnits="userSpaceOnUse">
            <g transform="translate(32, 32) rotate(-15)">
              <IconRenderer 
                name={theme.icon} 
                size={28} 
                color={theme.color} 
                strokeWidth={1.5} 
                opacity={0.15} 
                style={{ transform: 'translate(-14px, -14px)' }}
              />
            </g>
          </pattern>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#bg-pattern)" />
      </svg>
    );
  }

  return (
    <div 
      className="fixed inset-0 w-full h-full -z-10 pointer-events-none transition-all duration-500"
      style={theme.style}
    />
  );
}
