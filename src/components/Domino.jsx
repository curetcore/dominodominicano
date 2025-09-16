import React from 'react'

function Domino({ domino, horizontal = false, hidden = false, onClick, selectable = false, selected = false }) {
  const renderDots = (value) => {
    const dotPositions = {
      0: [],
      1: [[1, 1]],
      2: [[0, 0], [2, 2]],
      3: [[0, 0], [1, 1], [2, 2]],
      4: [[0, 0], [0, 2], [2, 0], [2, 2]],
      5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
      6: [[0, 0], [0, 1], [0, 2], [2, 0], [2, 1], [2, 2]]
    }

    const dots = dotPositions[value] || []

    return (
      <div className="relative w-full h-full p-1">
        {dots.map(([x, y], idx) => (
          <div
            key={idx}
            className="absolute w-2 h-2 bg-gray-900 rounded-full"
            style={{
              left: `${20 + x * 30}%`,
              top: `${20 + y * 30}%`,
              transform: 'translate(-50%, -50%)'
            }}
          />
        ))}
      </div>
    )
  }

  const baseClasses = `
    relative bg-white border-2 border-gray-900 rounded-lg shadow-lg 
    transition-all duration-300 ${selectable ? 'cursor-pointer' : ''}
    ${selected ? 'ring-4 ring-blue-500 ring-opacity-50' : ''}
    ${selectable && !selected ? 'hover:transform hover:-translate-y-1 hover:shadow-xl' : ''}
  `

  const sizeClasses = horizontal 
    ? 'w-24 h-12 flex flex-row' 
    : 'w-12 h-24 flex flex-col'

  if (hidden) {
    return (
      <div className={`${baseClasses} ${sizeClasses} bg-gray-700`}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white font-bold text-xl">?</div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={`${baseClasses} ${sizeClasses}`}
      onClick={selectable ? onClick : undefined}
    >
      <div className={`flex-1 ${horizontal ? 'border-r-2' : 'border-b-2'} border-gray-900`}>
        {renderDots(domino.top)}
      </div>
      <div className="flex-1">
        {renderDots(domino.bottom)}
      </div>
    </div>
  )
}

export default Domino