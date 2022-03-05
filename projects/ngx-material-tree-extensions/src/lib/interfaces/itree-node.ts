/**
 * Basic scaffold for displaying a nested node within a tree.
 */
export interface ITreeNode<TTreeNode> {
    // #region Properties

    /**
     * Children for this nested node.
     */
    children?: TTreeNode[];

    // #endregion
}
