"use client";

export default function PrintRolesButton() {
  return (
    <button className="button dark printButton" onClick={() => window.print()}>
      Generate Printable Role Pack
    </button>
  );
}
