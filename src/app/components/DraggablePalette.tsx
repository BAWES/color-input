import { Droppable, Draggable } from 'react-beautiful-dnd';
import { Color, Palette } from '../types';
import { GripVertical } from 'lucide-react';

interface DraggablePaletteProps {
  palette: Palette;
  index: number;
  onSelectColor: (color: string) => void;
}

export default function DraggablePalette({ palette, index, onSelectColor }: DraggablePaletteProps) {
  return (
    <Draggable draggableId={palette.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="rounded-lg border bg-card p-4 shadow-sm"
        >
          <div {...provided.dragHandleProps} className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-card-foreground">{palette.name}</h3>
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
          
          <Droppable droppableId={palette.id} direction="horizontal" type="COLOR">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`flex gap-2 min-h-[2.5rem] rounded-md transition-colors ${
                  snapshot.isDraggingOver ? 'bg-accent/50' : ''
                }`}
              >
                {palette.colors.map((color, colorIndex) => (
                  <Draggable key={color.id} draggableId={color.id} index={colorIndex}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`w-8 h-8 rounded-md cursor-pointer transition-all border shadow-sm ${
                          snapshot.isDragging ? 'scale-110 ring-2 ring-primary' : 'hover:scale-105'
                        }`}
                        style={{
                          backgroundColor: color.value,
                          ...provided.draggableProps.style,
                        }}
                        onClick={() => onSelectColor(color.value)}
                      />
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      )}
    </Draggable>
  );
} 