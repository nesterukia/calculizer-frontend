import { useSelector } from 'react-redux'
import './App.css'
import { Header } from './components/Header/Header'
import { RootState } from './store/store'
import { Calculator } from './components/Calculator/Calculator'

function App() {
  const {isConnected} = useSelector((state: RootState) => state.connection);
  return (
    <>
      <Header />
      <Calculator disabled={!isConnected}/>
    </>
  )
}

export default App
