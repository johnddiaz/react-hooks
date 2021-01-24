// useState: tic tac toe
// http://localhost:3000/isolated/exercise/04.js

import * as React from 'react'

function useLocalStorageState(key, defaultValue) {
  const [value, setValue] = React.useState(() => {
    const lsValue = window.localStorage.getItem(key);
    const d = lsValue 
    ? JSON.parse(lsValue) 
    : typeof defaultValue === 'function'
    ? defaultValue()
    : defaultValue;
    return d
  })

  React.useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value])

  return [value, setValue];
}

function Board({squares, setSquares, selectSquare, status}) {
  function restart() {
    setSquares(Array(9).fill(null));
  }

  function renderSquare(i) {
    return (
      <button className="square" onClick={() => selectSquare(i)}>
        {squares[i]}
      </button>
    )
  }

  return (
    <div>
      <div className="status">{status}</div>
      <div className="board-row">
        {renderSquare(0)}
        {renderSquare(1)}
        {renderSquare(2)}
      </div>
      <div className="board-row">
        {renderSquare(3)}
        {renderSquare(4)}
        {renderSquare(5)}
      </div>
      <div className="board-row">
        {renderSquare(6)}
        {renderSquare(7)}
        {renderSquare(8)}
      </div>
      <button className="restart" onClick={restart}>
        restart
      </button>
    </div>
  )
}

function Game() {
  const [squares, setSquares] = useLocalStorageState('squares', () => Array(9).fill(null));
  const [history, setHistory] = useLocalStorageState('squaresHistory', [squares]);
  
  const currentHistoryIndex = calculateCurrentHistory(squares, history);
  const nextValue = calculateNextValue(squares);
  const winner = calculateWinner(squares);
  const status = calculateStatus(winner, squares, nextValue);

  // React.useEffect(() => {
  //   if (currentHistoryIndex === -1) {  // player clicked on square and NOT history button
  //     console.log(currentHistoryIndex, history.length)
  //     setHistory(prev => {
  //       const copy = [...prev];
  //       copy.push(squares);
  //       return copy;
  //     })
  //   } else {
  //     console.log('what')
  //   }
  // }, [squares, currentHistoryIndex])

  function handleHistoryClick(event) {
    setSquares(history[event.target.id])
  }

  function selectSquare(square) {
    if (winner || squares[square]) {
      return;
    }
    const squaresCopy = [...squares];
    squaresCopy[square] = nextValue;
    setSquares(squaresCopy);
    setHistory(prev => {
      const slice = prev.slice(0, currentHistoryIndex+1);
      slice.push(squaresCopy);
      return slice;
    })
  }

  return (
    <div className="game">
      <div className="game-board">
        <Board squares={squares} setSquares={setSquares} selectSquare={selectSquare} status={status}/>
      </div>
      <ol>
        {
          history.map((h, index) => {
            let text = index === 0 ? 'Go to game start' : `Go to move #${index}`;
            const current = index === currentHistoryIndex;
            if (current) {
              text = `${text} (current)`
            }
            return (
              <li key={JSON.stringify(h)}>
                <input id={index} type={'button'} disabled={current} onClick={handleHistoryClick} value={text} />
              </li>
            )
          }) 
        }
      </ol>
    </div>
  )
}

function calculateCurrentHistory(squares, history) {
  return history.findIndex(historyArray => {
    for (let i = 0; i < historyArray.length; i++) {
      if (squares[i] !== historyArray[i]) {
        return false;
      }
    }
    return true;
  })
}

// eslint-disable-next-line no-unused-vars
function calculateStatus(winner, squares, nextValue) {
  return winner
    ? `Winner: ${winner}`
    : squares.every(Boolean)
    ? `Scratch: Cat's game`
    : `Next player: ${nextValue}`
}

// eslint-disable-next-line no-unused-vars
function calculateNextValue(squares) {
  const xSquaresCount = squares.filter(r => r === 'X').length
  const oSquaresCount = squares.filter(r => r === 'O').length
  return oSquaresCount === xSquaresCount ? 'X' : 'O'
}

// eslint-disable-next-line no-unused-vars
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ]
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i]
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a]
    }
  }
  return null
}

function App() {
  return <Game />
}

export default App
