/// <reference types="react" />
/// <reference types="react-dom" />

declare module 'three' {
  export * from 'three';
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
} 