import { Arr } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';
import { Generators } from '../api/Generators';
import * as Structs from '../api/Structs';
import * as TableGrid from './TableGrid';
import { Warehouse } from './Warehouse';

const toDetails = (grid: Structs.RowCells[], comparator: (a: SugarElement, b: SugarElement) => boolean) => {
  const seen = Arr.map(grid, (row) =>
    Arr.map(row.cells, () => false)
  );

  const updateSeen = (rowIndex: number, columnIndex: number, rowspan: number, colspan: number) => {
    for (let row = rowIndex; row < rowIndex + rowspan; row++) {
      for (let column = columnIndex; column < columnIndex + colspan; column++) {
        seen[row][column] = true;
      }
    }
  };

  return Arr.map(grid, (row, rowIndex) => {
    const details = Arr.bind(row.cells, (cell, columnIndex) => {
      // if we have seen this one, then skip it.
      if (seen[rowIndex][columnIndex] === false) {
        const result = TableGrid.subgrid(grid, rowIndex, columnIndex, comparator);
        updateSeen(rowIndex, columnIndex, result.rowspan, result.colspan);
        return [ Structs.detailnew(cell.element, result.rowspan, result.colspan, cell.isNew) ];
      } else {
        return [] as Structs.DetailNew[];
      }
    });
    return Structs.rowdetails(details, row.section);
  });
};

const toGrid = (warehouse: Warehouse, generators: Generators, isNew: boolean) => {
  const grid: Structs.RowCells[] = [];

  for (let rowIndex = 0; rowIndex < warehouse.grid.rows; rowIndex++) {
    const rowCells: Structs.ElementNew[] = [];
    for (let columnIndex = 0; columnIndex < warehouse.grid.columns; columnIndex++) {
      // The element is going to be the element at that position, or a newly generated gap.
      const element = Warehouse.getAt(warehouse, rowIndex, columnIndex).map((item) =>
        Structs.elementnew(item.element, isNew)
      ).getOrThunk(() =>
        Structs.elementnew(generators.gap(), true)
      );
      rowCells.push(element);
    }
    const row = Structs.rowcells(rowCells, warehouse.all[rowIndex].section);
    grid.push(row);
  }

  if (Warehouse.hasColumns(warehouse)) {
    const groupElementNew = Arr.map(warehouse.groups, (group: SugarElement): Structs.ElementNew =>
      Structs.elementnew(group, isNew)
    );

    grid.push(Structs.rowcells(groupElementNew, 'colgroup'));
  }

  return grid;
};

export {
  toDetails,
  toGrid
};
