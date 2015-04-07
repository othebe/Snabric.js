// Typescript definitions for Snabric.js

declare var Snabric: {
    new (element: HTMLCanvasElement): Snabric.ISnabric;
}

declare module Snabric {
    export interface ISnabric {
        getCanvas(): fabric.ICanvas;
        getFImg(sImg: IImage): fabric.IImage;
        handleKeyPress(e: KeyboardEvent): void;
        loadFromUrl(url: string, onLoad: (IImage) => void): void;
        setGridVisibility(isVisible: boolean, options?: Object): void;
    }

    export interface IImage {
        getSnap(): Snap.Paper;
        updateSnap(paper: Snap.Paper): void;
    }
} 