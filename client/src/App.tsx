import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <h1>Notion PDF Exporter</h1>
      <div className="card">
        <p>Frontend initialized and ready for development</p>
      </div>
    </div>
  )
}

export default App
