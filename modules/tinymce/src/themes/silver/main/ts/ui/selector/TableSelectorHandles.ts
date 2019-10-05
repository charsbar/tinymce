import { Button, Behaviour, Dragging, Unselecting, DragCoord, Attachment, GuiFactory } from "@ephox/alloy";
import { PlatformDetection } from '@ephox/sand';
import { Arr, Option, Cell } from '@ephox/katamari';
import { Position, Element } from '@ephox/sugar';

const setup = (editor, sink) => {
  const tlTds = Cell<Element[]>([]);
  const brTds = Cell<Element[]>([]);

  const getTopLeftSnaps = () => {
    return Arr.map(tlTds.get(), (td) => {
      const thisRect = td.dom().getBoundingClientRect();
      return Dragging.snap({
        sensor: DragCoord.fixed(thisRect.left, thisRect.top),
        range: Position(thisRect.width, thisRect.height),
        output: DragCoord.absolute(Option.some(thisRect.left), Option.some(thisRect.top)),
        extra: {
          td
        }
      });
    });
  };

  // TODO: Make the sensor snap to the bottom right by subtracting the width and height of the button from the output
  const getBottomRightSnaps = () => {
    return Arr.map(brTds.get(), (td) => {
      const thisRect = td.dom().getBoundingClientRect();
      return Dragging.snap({
        sensor: DragCoord.fixed(thisRect.left, thisRect.top),
        range: Position(thisRect.width, thisRect.height),
        output: DragCoord.absolute(Option.some(thisRect.left + thisRect.width), Option.some(thisRect.top + thisRect.height)),
        extra: {
          td
        }
      });
    });
  };

  const topLeftSnaps = {
    getSnapPoints: getTopLeftSnaps,
    leftAttr: 'data-drag-left',
    topAttr: 'data-drag-top',
    onSensor: (component, extra) => {
      startCell.set(extra.td);
      editor.fire('tableselectorchange', {
        start: startCell.get(),
        finish: endCell.get()
      });
    },
    mustSnap: true
  };

  const bottomRightSnaps = {
    getSnapPoints: getBottomRightSnaps,
    leftAttr: 'data-drag-left',
    topAttr: 'data-drag-top',
    onSensor: (component, extra) => {
      endCell.set(extra.td);
      editor.fire('tableselectorchange', {
        start: startCell.get(),
        finish: endCell.get()
      });
    },
    mustSnap: true
  };

  const topLeftSketch = Button.sketch({
    dom: {
      tag: 'span',
      innerHtml: 'TL',
      styles: {
        padding: '10px',
        display: 'inline-block',
        background: '#333',
        color: '#fff'
      }
    },

    buttonBehaviours: Behaviour.derive([
      Dragging.config(
        PlatformDetection.detect().deviceType.isTouch() ? {
          mode: 'touch',
          snaps: topLeftSnaps
        } : {
          mode: 'mouse',
          blockerClass: 'blocker',
          snaps: topLeftSnaps
        }
      ),
      Unselecting.config({ })
    ]),
    eventOrder: {
      // Because this is a button, allow dragging. It will stop clicking.
      mousedown: [ 'dragging', 'alloy.base.behaviour' ]
    }
  });

  const bottomRightSketch = Button.sketch({
    dom: {
      tag: 'span',
      innerHtml: 'BR',
      styles: {
        padding: '10px',
        display: 'inline-block',
        background: '#333',
        color: '#fff'
      }
    },

    buttonBehaviours: Behaviour.derive([
      Dragging.config(
        PlatformDetection.detect().deviceType.isTouch() ? {
          mode: 'touch',
          snaps: bottomRightSnaps
        } : {
          mode: 'mouse',
          blockerClass: 'blocker',
          snaps: bottomRightSnaps
        }
      ),
      Unselecting.config({ })
    ]),
    eventOrder: {
      // Because this is a button, allow dragging. It will stop clicking.
      mousedown: [ 'dragging', 'alloy.base.behaviour' ]
    }
  });

  const topLeft = GuiFactory.build(topLeftSketch);
  const bottomRight = GuiFactory.build(bottomRightSketch);

  const isVisible = Cell<Boolean>(false);
  const startCell = Cell<any>(null);
  const endCell = Cell<any>(null);

  editor.on('tableselectionchange', (e) => {
    if (!isVisible.get()) {
      Attachment.attach(sink, topLeft);
      Attachment.attach(sink, bottomRight);
      isVisible.set(true);
    }
    startCell.set(e.start);
    endCell.set(e.end);
    
    e.otherCells.each((otherCells) => {
      tlTds.set(otherCells.upOrLeftCells);
      const tLsnaps = getTopLeftSnaps();
      const lastSnap = tLsnaps[tLsnaps.length - 1];
      Dragging.snapTo(topLeft, lastSnap);

      brTds.set(otherCells.downOrRightCells);
      const snaps = getBottomRightSnaps();
      const firstSnap = snaps[0];
      Dragging.snapTo(bottomRight, firstSnap);
    });
  });

  editor.on('tableselectionclear', () => {
    if (isVisible.get()) {
      Attachment.detach(topLeft);
      Attachment.detach(bottomRight);
      isVisible.set(false);
    }
  });
};

export default {
  setup
};