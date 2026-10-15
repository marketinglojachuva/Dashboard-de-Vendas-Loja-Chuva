import { Route, Switch } from 'wouter'
import Home from '@/pages/Home'
import ImportHistory from '@/pages/ImportHistory'

function App() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/historico" component={ImportHistory} />
      <Route>
        <div className="flex items-center justify-center h-screen">
          <h1 className="text-2xl font-bold">Página não encontrada</h1>
        </div>
      </Route>
    </Switch>
  )
}

export default App
