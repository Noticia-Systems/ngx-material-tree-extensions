import { ITreeNode } from "../interfaces/itree-node";

/**
 * Flat node representation for MatTree.
 */
export class TreeFlatNode<TTreeNode extends ITreeNode<TTreeNode>> {

    // #region Constructors

    /**
     * Initializes a new instance of the TreeFlatNode class.
     * @param node Associated nested node.
     * @param expandable Whether a tree node is expandable / has children.
     * @param level Nested node level.
     */
    constructor(
      public node: TTreeNode,
      public expandable: boolean,
      public level: number) {
    }

    // #endregion
}
