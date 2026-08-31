import { useCallback, useState } from 'react'

type Theme = 'light' | 'dark'

const STORAGE_KEY = 'kindi-theme'

function systemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function currentTheme(): Theme {
  const stored = document.documentElement.dataset.theme
  return stored === 'light' || stored === 'dark' ? stored : systemTheme()
}

function persist(theme: Theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    void 0
  }
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(currentTheme)

  const toggle = useCallback(() => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    persist(next)
    setTheme(next)
  }, [theme])

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      className="fixed right-3.5 top-3.5 z-50 grid h-[34px] w-[34px] place-items-center rounded-[9px] border border-line bg-surface text-[1rem] text-text-dim transition-colors hover:border-brass hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass"
    >
      ◑
    </button>
  )
}
