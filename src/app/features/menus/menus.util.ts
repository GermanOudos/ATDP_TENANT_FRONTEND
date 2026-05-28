import { MenuDto, MenuTreeNode } from '@schemas/menu.schema';

export function buildMenuTree(items: MenuDto[]): MenuTreeNode[] {
  const map = new Map<number, MenuTreeNode>();
  const roots: MenuTreeNode[] = [];

  items.forEach((item) => {
    map.set(item.idMenu, { ...item, children: [] });
  });

  map.forEach((node) => {
    if (node.idMenuPrimary !== null && map.has(node.idMenuPrimary)) {
      map.get(node.idMenuPrimary)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  roots.forEach((root) => sortByOrder(root));
  return roots.sort((a, b) => a.order - b.order);
}

function sortByOrder(node: MenuTreeNode): void {
  node.children.sort((a, b) => a.order - b.order);
  node.children.forEach((child) => sortByOrder(child));
}
