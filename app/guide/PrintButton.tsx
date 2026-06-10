"use client";

export default function PrintButton() {
  return (
    <button className="button dark printButton" onClick={() => window.print()}>
      Print guide
    </button>
  );
}
