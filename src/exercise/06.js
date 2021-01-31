// useEffect: HTTP requests
// http://localhost:3000/isolated/exercise/06.js

import * as React from 'react'
import {ErrorBoundary} from 'react-error-boundary'
import { isThisTypeNode } from 'typescript';
// 🐨 you'll want the following additional things from '../pokemon':
// fetchPokemon: the function we call to get the pokemon info
// PokemonInfoFallback: the thing we show while we're loading the pokemon info
// PokemonDataView: the stuff we use to display the pokemon info
import {PokemonForm, PokemonDataView, PokemonInfoFallback, fetchPokemon} from '../pokemon'

const statuses = {
  idle: 'idle',
  pending: 'pending',
  resolved: 'resolved',
  rejected: 'rejected'
}


function ErrorFallback({error, resetErrorBoundary}) {
  return (
    <div role="alert">
      There was an error: <pre style={{whiteSpace: 'normal'}}>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  )
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
      pokemon: pokemonName ? statuses.pending : statuses.idle, 
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

  function handleReset() {
    setPokemonName('')
  }

  return (
    <div className="pokemon-info-app">
      <PokemonForm pokemonName={pokemonName} onSubmit={handleSubmit} />
      <hr />
      <div className="pokemon-info">
        <ErrorBoundary FallbackComponent={ErrorFallback} onReset={handleReset} resetKeys={[pokemonName]}>
          <PokemonInfo pokemonName={pokemonName} />
        </ErrorBoundary>  
      </div>
    </div>
  )
}

export default App
