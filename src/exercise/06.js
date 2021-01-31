// useEffect: HTTP requests
// http://localhost:3000/isolated/exercise/06.js

import * as React from 'react'
// 🐨 you'll want the following additional things from '../pokemon':
// fetchPokemon: the function we call to get the pokemon info
// PokemonInfoFallback: the thing we show while we're loading the pokemon info
// PokemonDataView: the stuff we use to display the pokemon info
import {PokemonForm, PokemonDataView, PokemonInfoFallback, fetchPokemon} from '../pokemon'

// From https://reactjs.org/docs/error-boundaries.html
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children; 
  }
}

const statuses = {
  idle: 'idle',
  pending: 'pending',
  resolved: 'resolved',
  rejected: 'rejected'
}

function pokemonMetaReducer(prevState, action) {
  switch (action.type) {
    case statuses.pending:
      return {
        ...prevState,
        pokemon: null,
        error: null,
        status: action.type
      }
    case statuses.resolved:
      return {
        ...prevState,
        pokemon: action.pokemon,
        status: action.type
      }
    case statuses.rejected:
      return {
        ...prevState,
        error: action.error,
        status: action.type
      }
    default:
      return prevState;
  }
}

function PokemonInfo({pokemonName}) {
  const [pokemonMeta, pokemonMetaDispatch] = React.useReducer(
    pokemonMetaReducer, 
    {
      pokemon: null, 
      error: null, 
      status: statuses.idle
    }
  )

  React.useEffect(() => {
    if (!pokemonName) {
      return;
    }
    pokemonMetaDispatch({type: statuses.pending})
    fetchPokemon(pokemonName)
      .then(pokemonData => {
        pokemonMetaDispatch({type: statuses.resolved, pokemon: pokemonData})
      })
      .catch(error => {
        pokemonMetaDispatch({type: statuses.rejected, error: error})
      })
  }, [pokemonName])

  function getView() {
    switch (pokemonMeta.status) {
      case statuses.idle:
        return 'Submit a pokemon';
      case statuses.pending:
        return <PokemonInfoFallback name={pokemonName} />;
      case statuses.resolved:
        return <PokemonDataView pokemon={pokemonMeta.pokemon} />;
      case statuses.rejected:
        throw pokemonMeta.error
        // return (
        //   <div role="alert">
        //     There was an error: <pre style={{whiteSpace: 'normal'}}>{pokemonMeta.error.message}</pre>
        //   </div>
        // )
      default:
        return null;
    }
  }

  return getView()
}

function App() {
  const [pokemonName, setPokemonName] = React.useState('')

  function handleSubmit(newPokemonName) {
    setPokemonName(newPokemonName)
  }

  return (
    <div className="pokemon-info-app">
      <PokemonForm pokemonName={pokemonName} onSubmit={handleSubmit} />
      <hr />
      <div className="pokemon-info">
        <ErrorBoundary>
          <PokemonInfo pokemonName={pokemonName} />
        </ErrorBoundary>  
      </div>
    </div>
  )
}

export default App
