"use client";

export default function CurrentYear() {
  return <span>{new Date().getFullYear()}</span>;
}
