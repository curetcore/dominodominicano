import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  DndContext, 
  DragOverlay,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor
} from '@dnd-kit/core'
import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove
} from '@dnd-kit/sortable'
import ModernDomino from './ModernDomino'

function ModernPlayerHand({ 
  dominoes, 
  isMyTurn, 
  onDominoClick, 
  selectedIndex,
  onDragEnd,
  onSort
}) {
  const [activeId, setActiveId] = React.useState(null)
  
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 8,
      },
    })
  )

  const handleDragStart = (event) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = (event) => {
    const {active, over} = event
    setActiveId(null)

    if (over && over.id.startsWith('table-')) {
      // Dropped on table
      const dominoIndex = parseInt(active.id.split('-')[1])
      const side = over.data.current.side
      onDragEnd(dominoIndex, side)
    } else if (over && active.id !== over.id) {
      // Reordering in hand
      const oldIndex = dominoes.findIndex(d => `domino-${dominoes.indexOf(d)}` === active.id)
      const newIndex = dominoes.findIndex(d => `domino-${dominoes.indexOf(d)}` === over.id)
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(dominoes, oldIndex, newIndex)
        onSort?.(newOrder)
      }
    }
  }

  const activeDomino = activeId 
    ? dominoes[parseInt(activeId.split('-')[1])]
    : null

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="relative">
        {/* Hand background */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent rounded-t-3xl" />
        
        {/* Wood rack effect */}
        <div className="relative bg-gradient-to-b from-amber-800 to-amber-900 p-4 rounded-t-3xl shadow-2xl">
          <div 
            className="absolute inset-0 opacity-30 rounded-t-3xl"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='wood' patternUnits='userSpaceOnUse' width='100' height='100'%3E%3Cpath d='M0 0h100v100H0z' fill='%23654321'/%3E%3Cpath d='M0 20h100M0 40h100M0 60h100M0 80h100' stroke='%23543210' stroke-width='0.5' opacity='0.3'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23wood)'/%3E%3C/svg%3E")`,
              backgroundSize: '200px 200px'
            }}
          />
          
          {/* Rack groove */}
          <div className="absolute bottom-2 left-4 right-4 h-1 bg-amber-950 rounded-full shadow-inner" />
          
          <div className="relative">
            {/* Turn indicator */}
            <AnimatePresence>
              {isMyTurn && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="absolute -top-12 left-1/2 transform -translate-x-1/2"
                >
                  <div className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    ¡Es tu turno!
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Dominoes container */}
            <SortableContext
              items={dominoes.map((_, i) => `domino-${i}`)}
              strategy={horizontalListSortingStrategy}
            >
              <div className="flex items-end justify-center gap-2 pb-2 min-h-[140px]">
                <AnimatePresence>
                  {dominoes.map((domino, index) => (
                    <motion.div
                      key={`domino-${index}`}
                      initial={{ scale: 0, y: 50 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0, y: 50 }}
                      transition={{ 
                        type: "spring",
                        stiffness: 200,
                        damping: 20,
                        delay: index * 0.05
                      }}
                    >
                      <ModernDomino
                        id={`domino-${index}`}
                        domino={domino}
                        onClick={() => onDominoClick(domino, index)}
                        selectable={isMyTurn}
                        selected={selectedIndex === index}
                        inHand={true}
                        scale={0.9}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </SortableContext>
          </div>
        </div>

        {/* Action buttons */}
        <div className="absolute -top-16 right-4 flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/20 transition-colors"
            onClick={() => {/* Sort by value */}}
          >
            Ordenar
          </motion.button>
        </div>
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {activeDomino && (
          <ModernDomino
            domino={activeDomino}
            scale={1.1}
            style={{
              cursor: 'grabbing',
            }}
          />
        )}
      </DragOverlay>
    </DndContext>
  )
}

export default ModernPlayerHand