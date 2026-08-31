import './App.css'
import { ThemeToggle } from './components/ThemeToggle'

function App() {
  return (
    <div className="stage">
      <div className="glow" aria-hidden="true" />
      <ThemeToggle />
    </div>
  )
}

export default App
